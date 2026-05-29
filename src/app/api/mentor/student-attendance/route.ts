import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadMentorAttendanceByDate } from "@/lib/mentor-data-loader";
import { getWibYmd } from "@/components/internship/attendance/attendance-data";

const querySchema = z.object({
  // date-only "yyyy-MM-dd" (WIB calendar date).
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** Today's WIB calendar date as a zero-padded "yyyy-MM-dd" (lexicographically
 *  comparable to the requested date). */
function wibTodayISO(): string {
  const t = getWibYmd(new Date().toISOString());
  return `${t.year}-${String(t.month + 1).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}

/** GET /api/mentor/student-attendance?date=YYYY-MM-DD → class roster for that date. */
export async function GET(req: Request) {
  try {
    const auth = await requireRoleInRoute(Role.MENTOR);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({ date: searchParams.get("date") });
    if (!parsed.success) {
      return Response.json(
        { error: "Parameter tanggal tidak valid." },
        { status: 400 },
      );
    }

    // Mentors monitor past/present only — reject future dates (string compare is
    // safe for zero-padded ISO dates).
    if (parsed.data.date > wibTodayISO()) {
      return Response.json(
        { error: "Tidak bisa melihat absensi tanggal yang akan datang." },
        { status: 400 },
      );
    }

    const data = await loadMentorAttendanceByDate(auth.user.id, parsed.data.date);
    if (!data) {
      return Response.json(
        { error: "Kamu belum ditugaskan ke kelas mana pun." },
        { status: 404 },
      );
    }
    return Response.json({ data });
  } catch (err) {
    console.error("[mentor/attendance][GET]", err);
    return Response.json(
      { error: "Gagal memuat data absensi." },
      { status: 500 },
    );
  }
}
