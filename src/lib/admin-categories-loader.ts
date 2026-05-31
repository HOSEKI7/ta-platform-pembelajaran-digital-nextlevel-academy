import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  type AdminCategoriesParams,
  type AdminCategoriesResult,
  type AdminCategoryRow,
  type CategorySort,
  PAGE_SIZE,
} from "@/lib/admin-categories-query";

/**
 * Data loader for the admin Kategori Course list (PRD §6.11.3.1). Server-only —
 * mirror of the badges/vouchers loaders: filtering + pagination run in SQL, the
 * result is JSON-serialisable for TanStack hydration. The route handler and the
 * page both call this.
 */

function buildWhere(search: string): Prisma.CategoryWhereInput {
  if (!search) return {};
  return { name: { contains: search, mode: "insensitive" } };
}

function buildOrderBy(
  sort: CategorySort,
): Prisma.CategoryOrderByWithRelationInput {
  switch (sort) {
    case "name_desc":
      return { name: "desc" };
    case "courses_desc":
      return { courses: { _count: "desc" } };
    case "newest":
      return { createdAt: "desc" };
    case "name_asc":
    default:
      return { name: "asc" };
  }
}

export async function loadAdminCategoriesPage(
  params: AdminCategoriesParams,
): Promise<AdminCategoriesResult> {
  const where = buildWhere(params.search);
  const page = Math.max(1, params.page);

  const [total, rows] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: buildOrderBy(params.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { courses: true, vouchers: true } },
      },
    }),
  ]);

  const pageRows: AdminCategoryRow[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    courseCount: c._count.courses,
    voucherCount: c._count.vouchers,
    createdAt: c.createdAt.toISOString(),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { rows: pageRows, total, page, pageSize: PAGE_SIZE, totalPages };
}
