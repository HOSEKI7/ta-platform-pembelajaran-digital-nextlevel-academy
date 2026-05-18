import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { markAllNotificationsRead } from "@/lib/student-data-loader";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  try {
    const data = await markAllNotificationsRead(session.user.id);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[POST /api/student/notifications/mark-all-read]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
