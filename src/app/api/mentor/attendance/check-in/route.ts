import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { performMentorCheckIn } from "@/lib/mentor-data-loader";

/**
 * POST /api/mentor/attendance/check-in
 * Records the mentor's own attendance for today. All gating is server-side
 * (period, working day, holiday, WIB window, idempotency) — the client's clock
 * is never trusted.
 */
export async function POST() {
  try {
    const auth = await requireRoleInRoute(Role.MENTOR);
    if (auth instanceof Response) return auth;

    const result = await performMentorCheckIn(auth.user.id);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(
      { data: { dateISO: result.dateISO, checkInTime: result.checkInTime } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[mentor/attendance/check-in][POST]", err);
    return Response.json({ error: "Gagal melakukan check-in." }, { status: 500 });
  }
}
