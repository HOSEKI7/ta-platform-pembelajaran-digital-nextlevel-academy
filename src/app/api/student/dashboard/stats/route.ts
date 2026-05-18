import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadDashboardStats } from "@/lib/student-data-loader";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  try {
    const data = await loadDashboardStats(session.user.id);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/student/dashboard/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
