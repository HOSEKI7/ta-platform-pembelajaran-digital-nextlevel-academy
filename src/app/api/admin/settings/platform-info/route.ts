import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadPlatformInfo } from "@/lib/admin-settings-loader";
import { updatePlatformInfo } from "@/lib/admin-platform-settings-write";
import { platformInfoSchema } from "@/lib/validations/admin-platform-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — current platform-info blob. */
export async function GET() {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const data = await loadPlatformInfo();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/settings/platform-info GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat informasi platform." },
      { status: 500 },
    );
  }
}

/** PUT — replace the platform-info blob (PRD §6.11.11). */
export async function PUT(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = platformInfoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Informasi platform tidak valid." },
      { status: 400 },
    );
  }

  const result = await updatePlatformInfo(parsed.data, {
    actorId: auth.user.id,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Gagal menyimpan informasi platform. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: parsed.data });
}
