import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAttendanceFilterOptions } from "@/lib/admin-internship-attendance-loader";

/**
 * GET /api/admin/internship/attendance/filters
 * → Batch / Field / Class dropdown options + the earliest navigable date.
 * Cheap and static-ish; the client caches it and cascades the dropdowns.
 */
export async function GET() {
  try {
    const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
    if (auth instanceof Response) return auth;

    const data = await loadAttendanceFilterOptions();
    return Response.json({ data });
  } catch (err) {
    console.error("[admin/internship/attendance/filters][GET]", err);
    return Response.json({ error: "Gagal memuat filter." }, { status: 500 });
  }
}
