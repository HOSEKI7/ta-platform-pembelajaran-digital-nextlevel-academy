import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminNavIndicators } from "@/lib/admin-nav-indicators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications/indicators
 * → `{ users, transactions }` booleans driving the red dots on the admin
 * sidebar (Pengguna / Keuangan→Transaksi).
 */
export async function GET() {
  const session = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (session instanceof Response) return session;

  try {
    const data = await loadAdminNavIndicators();
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/admin/notifications/indicators]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
