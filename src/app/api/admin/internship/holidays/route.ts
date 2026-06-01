import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadHolidayConfig } from "@/lib/admin-internship-holiday-loader";
import {
  createHoliday,
  describeHolidayFailure,
} from "@/lib/admin-internship-holiday-write";
import { holidayCreateSchema } from "@/lib/validations/admin-internship-holiday";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/internship/holidays — all holidays + server-computed today (WIB)
 * for the admin "Konfigurasi Jam Kerja dan Libur" surface (PRD §6.9 / §5.3).
 * Gated to ADMINISTRATOR. The list is small; the client sorts/derives state.
 */
export async function GET() {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const data = await loadHolidayConfig();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/internship/holidays GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat data libur." },
      { status: 500 },
    );
  }
}

/** POST /api/admin/internship/holidays — create a holiday. */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = holidayCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data libur tidak valid." },
      { status: 400 },
    );
  }

  const result = await createHoliday(parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeHolidayFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
