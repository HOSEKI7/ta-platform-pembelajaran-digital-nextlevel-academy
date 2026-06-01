import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadInternshipConfig } from "@/lib/admin-internship-config-loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/internship/config — full Batch / Bidang / Kelas hierarchy with
 * counts (PRD §6.9 / §5.3). Gated to ADMINISTRATOR. The lists are small; the
 * client sorts them per tab.
 */
export async function GET() {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const data = await loadInternshipConfig();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/internship/config GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat konfigurasi magang." },
      { status: 500 },
    );
  }
}
