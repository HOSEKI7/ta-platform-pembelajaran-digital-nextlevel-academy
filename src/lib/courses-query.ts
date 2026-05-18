/**
 * Shared types + query-key factory + URL parsers for the public courses
 * catalog. Safe to import from both Server Components and Client Components.
 *
 * The server-only loader lives in `./courses-loader.ts` so the prisma client
 * doesn't end up in the browser bundle.
 */

export const PAGE_SIZE = 9;

export const SORTS = ["latest", "popular", "price-asc", "price-desc"] as const;
export type Sort = (typeof SORTS)[number];

export type CoursesPageParams = {
  page: number;
  category: string | null;
  sort: Sort;
};

export type CoursesPageResult = {
  courses: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    price: number;
    fakePrice: number | null;
    estimatedDuration: number | null;
    instructor: string;
    category: { name: string };
  }[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function coursesQueryKey(params: CoursesPageParams) {
  return ["public", "courses", params] as const;
}

export function parseSort(value: string | null | undefined): Sort {
  return SORTS.includes(value as Sort) ? (value as Sort) : "latest";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
