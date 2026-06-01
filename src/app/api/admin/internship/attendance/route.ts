import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { getWibYmd } from "@/components/internship/attendance/attendance-data";
import { loadAdminAttendanceByDate } from "@/lib/admin-internship-attendance-loader";
import {
  parseId,
  parsePage,
  parseScope,
  parseSearch,
  type AdminAttendanceParams,
} from "@/lib/admin-internship-attendance-query";
import {
  describeAttendanceFailure,
  setAttendanceStatus,
} from "@/lib/admin-attendance-write";
import { setAttendanceSchema } from "@/lib/validations/admin-attendance";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's WIB calendar date as a zero-padded "yyyy-MM-dd". */
function wibTodayISO(): string {
  const t = getWibYmd(new Date().toISOString());
  return `${t.year}-${String(t.month + 1).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}

/**
 * GET /api/admin/internship/attendance
 *   ?scope=mentor|student&date=YYYY-MM-DD&batch=&field=&class=&search=&page=
 * → one page of the attendance roster for the selected date. Future dates are
 * clamped to today (admin manages past/present only).
 */
export async function GET(req: Request) {
  try {
    const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const todayISO = wibTodayISO();
    const rawDate = searchParams.get("date");
    const requested = rawDate && DATE_RE.test(rawDate) ? rawDate : todayISO;
    const dateISO = requested > todayISO ? todayISO : requested;

    const params: AdminAttendanceParams = {
      scope: parseScope(searchParams.get("scope")),
      dateISO,
      batchId: parseId(searchParams.get("batch")),
      fieldId: parseId(searchParams.get("field")),
      classId: parseId(searchParams.get("class")),
      search: parseSearch(searchParams.get("search")),
      page: parsePage(searchParams.get("page")),
    };

    const data = await loadAdminAttendanceByDate(params);
    return Response.json({ data });
  } catch (err) {
    console.error("[admin/internship/attendance][GET]", err);
    return Response.json({ error: "Gagal memuat data absensi." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/internship/attendance
 * body: { scope, userId, date, status: "HADIR" | "TIDAK_HADIR" }
 * → override one person's attendance for one date (writes explicit PRESENT/
 * ABSENT + AuditLog). All gating is server-side.
 */
export async function PATCH(req: Request) {
  try {
    const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
    if (auth instanceof Response) return auth;

    const body = await req.json().catch(() => null);
    const parsed = setAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Permintaan tidak valid." },
        { status: 400 },
      );
    }

    const { scope, userId, date, status } = parsed.data;
    const result = await setAttendanceStatus({
      scope,
      userId,
      dateISO: date,
      status,
      actorId: auth.user.id,
    });

    if (!result.ok) {
      const { status: code, error } = describeAttendanceFailure(result);
      return Response.json({ error }, { status: code });
    }
    return Response.json({ data: { ok: true } });
  } catch (err) {
    console.error("[admin/internship/attendance][PATCH]", err);
    return Response.json({ error: "Gagal menyimpan absensi." }, { status: 500 });
  }
}
