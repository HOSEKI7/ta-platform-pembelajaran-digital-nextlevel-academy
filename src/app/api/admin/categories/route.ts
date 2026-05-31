import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAdminCategoriesPage } from "@/lib/admin-categories-loader";
import {
  parsePage,
  parseSearch,
  parseSort,
} from "@/lib/admin-categories-query";
import {
  createCategory,
  describeCategoryFailure,
} from "@/lib/admin-category-write";
import { categoryFormSchema } from "@/lib/validations/admin-category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/categories — paginated, searchable, sortable category list
 * (PRD §6.11.3.1). Gated to ADMINISTRATOR.
 */
export async function GET(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const data = await loadAdminCategoriesPage({
      page: parsePage(searchParams.get("page")),
      search: parseSearch(searchParams.get("search")),
      sort: parseSort(searchParams.get("sort")),
    });
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[admin/categories GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar kategori." },
      { status: 500 },
    );
  }
}

/** POST /api/admin/categories — create a new category (PRD §6.11.3.1). */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = categoryFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." },
      { status: 400 },
    );
  }

  const result = await createCategory(parsed.data, { actorId: auth.user.id });

  if (!result.ok) {
    const { status, error } = describeCategoryFailure(result);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
