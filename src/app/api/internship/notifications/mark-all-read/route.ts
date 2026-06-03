import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { markAllNotificationsRead } from "@/lib/student-data-loader";

export const dynamic = "force-dynamic";

/**
 * POST /api/internship/notifications/mark-all-read
 * → marks the peserta-magang's unread notifications as read (reuses the
 * role-agnostic `markAllNotificationsRead`, keyed only by userId).
 */
export async function POST() {
  const session = await requireRoleInRoute(Role.PESERTA_MAGANG);
  if (session instanceof Response) return session;

  try {
    const data = await markAllNotificationsRead(session.user.id);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[POST /api/internship/notifications/mark-all-read]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
