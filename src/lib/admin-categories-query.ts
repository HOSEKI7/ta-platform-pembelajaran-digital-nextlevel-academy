/**
 * Shared types + query-key factory + URL parsers for the admin Kategori Course
 * surface at `/admin/courses/categories` (PRD §6.11.3.1). Safe to import from
 * both Server and Client Components — keep this file free of any Prisma /
 * server-only imports. The data layer lives in `./admin-categories-loader.ts`.
 */

export const PAGE_SIZE = 10;

/** Sort dropdown values — `name_asc` is the default. */
export const SORT_OPTIONS = [
  "name_asc",
  "name_desc",
  "courses_desc",
  "newest",
] as const;
export type CategorySort = (typeof SORT_OPTIONS)[number];

/** Indonesian labels for each sort option (UI). */
export const SORT_LABELS: Record<CategorySort, string> = {
  name_asc: "Nama (A–Z)",
  name_desc: "Nama (Z–A)",
  courses_desc: "Kursus terbanyak",
  newest: "Terbaru",
};

export type AdminCategoriesParams = {
  page: number;
  search: string;
  sort: CategorySort;
};

export type AdminCategoryRow = {
  id: string;
  name: string;
  description: string | null;
  /** Number of courses currently using this category. */
  courseCount: number;
  /** Number of vouchers scoped to this category. */
  voucherCount: number;
  /** ISO string (serialisable across the loader → hook boundary). */
  createdAt: string;
};

export type AdminCategoriesResult = {
  rows: AdminCategoryRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function adminCategoriesKey(params: AdminCategoriesParams) {
  return ["admin", "categories", params] as const;
}

export function parseSort(value: string | null | undefined): CategorySort {
  return SORT_OPTIONS.includes(value as CategorySort)
    ? (value as CategorySort)
    : "name_asc";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
