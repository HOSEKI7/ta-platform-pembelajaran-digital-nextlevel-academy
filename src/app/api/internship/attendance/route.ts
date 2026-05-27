import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAttendanceMonth } from "@/lib/internship-data-loader";

const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(0).max(11),
});

/** GET /api/internship/attendance?year=&month= → resolved month calendar grid. */
export async function GET(req: Request) {
  try {
    const auth = await requireRoleInRoute(Role.PESERTA_MAGANG);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      year: searchParams.get("year"),
      month: searchParams.get("month"),
    });
    if (!parsed.success) {
      return Response.json({ error: "Parameter year/month tidak valid." }, { status: 400 });
    }

    const month = await loadAttendanceMonth(
      auth.user.id,
      parsed.data.year,
      parsed.data.month,
    );
    if (!month) {
      return Response.json(
        { error: "Kamu belum ditempatkan di kelas magang." },
        { status: 404 },
      );
    }
    return Response.json({ data: month });
  } catch (err) {
    console.error("[internship/attendance][GET]", err);
    return Response.json({ error: "Gagal memuat data absensi." }, { status: 500 });
  }
}
