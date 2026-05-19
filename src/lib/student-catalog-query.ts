/**
 * Shared types + query-key factory + URL parsers for the student-area catalog
 * at `/catalog`. Safe to import from both Server Components and Client
 * Components — keep this file free of any Prisma / server-only imports.
 *
 * The data layer (Prisma queries) lives in `./student-catalog-loader.ts` so
 * the database client never gets pulled into the browser bundle.
 */

export const PAGE_SIZE = 9;

export const SORTS = ["latest", "popular", "price-asc", "price-desc"] as const;
export type Sort = (typeof SORTS)[number];

export type StudentCatalogParams = {
  page: number;
  category: string | null;
  sort: Sort;
  search: string;
};

export type StudentCatalogCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  shortDescription: string | null;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  instructor: string;
  category: { name: string };
  isOwned: boolean;
};

export type StudentCatalogResult = {
  courses: StudentCatalogCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function studentCatalogKey(params: StudentCatalogParams) {
  return ["student", "catalog", params] as const;
}

export function parseSort(value: string | null | undefined): Sort {
  return SORTS.includes(value as Sort) ? (value as Sort) : "latest";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
