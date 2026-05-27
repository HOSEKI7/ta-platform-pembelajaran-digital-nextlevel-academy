import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { performCheckIn } from "@/lib/internship-data-loader";

/**
 * POST /api/internship/attendance/check-in
 * Records today's attendance. All gating is server-side (period, working day,
 * holiday, WIB window, idempotency) — the client's clock is never trusted.
 */
export async function POST() {
  try {
    const auth = await requireRoleInRoute(Role.PESERTA_MAGANG);
    if (auth instanceof Response) return auth;

    const result = await performCheckIn(auth.user.id);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(
      { data: { dateISO: result.dateISO, checkInTime: result.checkInTime } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[internship/attendance/check-in][POST]", err);
    return Response.json({ error: "Gagal melakukan check-in." }, { status: 500 });
  }
}
