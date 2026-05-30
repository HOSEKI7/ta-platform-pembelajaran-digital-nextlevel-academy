import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminCoursesPage } from "@/lib/admin-courses-loader";
import {
  parsePage,
  parseSearch,
  parseStatus,
} from "@/lib/admin-courses-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/courses — paginated, filterable course list for the admin
 * Course Management table. Mirrors the student catalog endpoint but is gated to
 * ADMINISTRATOR and returns every status.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const data = await loadAdminCoursesPage({
      page: parsePage(searchParams.get("page")),
      category: category && category.length > 0 ? category : null,
      status: parseStatus(searchParams.get("status")),
      search: parseSearch(searchParams.get("search")),
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/courses GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar kursus." },
      { status: 500 },
    );
  }
}
