import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminGradeList } from "@/lib/admin-internship-grades-loader";
import {
  parseId,
  parsePage,
  parseSearch,
  type AdminGradeListParams,
} from "@/lib/admin-internship-grades-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/internship/grades
 *   ?search=&batch=&field=&class=&page=
 * → one page of the intern final-grade list across all classes (ADMINISTRATOR).
 */
export async function GET(req: Request) {
  try {
    const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const params: AdminGradeListParams = {
      search: parseSearch(searchParams.get("search")),
      batchId: parseId(searchParams.get("batch")),
      fieldId: parseId(searchParams.get("field")),
      classId: parseId(searchParams.get("class")),
      page: parsePage(searchParams.get("page")),
    };

    const data = await loadAdminGradeList(params);
    return Response.json({ data });
  } catch (err) {
    console.error("[admin/internship/grades][GET]", err);
    return Response.json({ error: "Gagal memuat daftar nilai." }, { status: 500 });
  }
}
