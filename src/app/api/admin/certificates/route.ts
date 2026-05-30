import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminCertificatesPage } from "@/lib/admin-certificates-loader";
import {
  parseCourseId,
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-certificates-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/certificates — paginated, searchable, filterable list of all
 * issued certificates (PRD §6.11.7). Read-only; gated to ADMINISTRATOR.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const data = await loadAdminCertificatesPage({
      page: parsePage(searchParams.get("page")),
      status: parseStatus(searchParams.get("status")),
      sort: parseSort(searchParams.get("sort")),
      search: parseSearch(searchParams.get("search")),
      courseId: parseCourseId(searchParams.get("courseId")),
    });
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/certificates GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar sertifikat." },
      { status: 500 },
    );
  }
}
