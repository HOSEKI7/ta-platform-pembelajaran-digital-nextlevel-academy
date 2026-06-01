import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { markAllNotificationsRead } from "@/lib/student-data-loader";

export const dynamic = "force-dynamic";

/**
 * POST /api/mentor/notifications/mark-all-read
 * → marks the mentor's unread notifications as read (reuses the role-agnostic
 * `markAllNotificationsRead`, keyed only by userId).
 */
export async function POST() {
  const session = await requireRoleInRoute(Role.MENTOR);
  if (session instanceof Response) return session;

  try {
    const data = await markAllNotificationsRead(session.user.id);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[POST /api/mentor/notifications/mark-all-read]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
