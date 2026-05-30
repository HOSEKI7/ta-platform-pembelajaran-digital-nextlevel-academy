import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminTransactionsPage } from "@/lib/admin-transactions-loader";
import {
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-transactions-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/transactions — paginated, searchable, filterable list of every
 * Peserta-Didik order for the admin Transaction Management table. Gated to
 * ADMINISTRATOR; excludes soft-deleted rows.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);

    const data = await loadAdminTransactionsPage({
      page: parsePage(searchParams.get("page")),
      status: parseStatus(searchParams.get("status")),
      sort: parseSort(searchParams.get("sort")),
      search: parseSearch(searchParams.get("search")),
    });

    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/transactions GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar transaksi." },
      { status: 500 },
    );
  }
}
