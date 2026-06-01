import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminTaskList } from "@/lib/admin-internship-tasks-loader";
import {
  parseId,
  parsePage,
  parseSearch,
  parseTaskStatus,
  type AdminTaskListParams,
} from "@/lib/admin-internship-tasks-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/internship/tasks
 *   ?search=&batch=&field=&class=&status=AKTIF|OVERDUE&page=
 * → one page of the internship task list across all classes (ADMINISTRATOR).
 */
export async function GET(req: Request) {
  try {
    const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const params: AdminTaskListParams = {
      search: parseSearch(searchParams.get("search")),
      batchId: parseId(searchParams.get("batch")),
      fieldId: parseId(searchParams.get("field")),
      classId: parseId(searchParams.get("class")),
      status: parseTaskStatus(searchParams.get("status")),
      page: parsePage(searchParams.get("page")),
    };

    const data = await loadAdminTaskList(params);
    return Response.json({ data });
  } catch (err) {
    console.error("[admin/internship/tasks][GET]", err);
    return Response.json({ error: "Gagal memuat daftar tugas." }, { status: 500 });
  }
}
