/**
 * Shared types + query-key factory + URL parsers for the admin Course
 * Management table at `/admin/courses`. Safe to import from both Server
 * Components and Client Components — keep this file free of any Prisma /
 * server-only imports.
 *
 * The data layer (Prisma queries) lives in `./admin-courses-loader.ts` so the
 * database client never gets pulled into the browser bundle.
 */

import type { CourseStatus } from "@/generated/prisma";

export const PAGE_SIZE = 10;

/** Status dropdown values — "all" is the unfiltered default. */
export const STATUS_FILTERS = [
  "all",
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export type AdminCoursesParams = {
  page: number;
  category: string | null;
  status: StatusFilter;
  search: string;
};

export type AdminCourseRow = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  category: { name: string };
  instructor: string;
  price: number;
  enrollmentCount: number;
  status: CourseStatus;
  /** ISO string — formatted to DD/MM/YYYY WIB on the client. */
  createdAt: string;
  /** ISO string or null (never published yet). */
  publishedAt: string | null;
};

export type AdminCoursesResult = {
  courses: AdminCourseRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** A category option for the filter dropdown (admin sees all statuses). */
export type AdminCourseCategory = {
  name: string;
  courseCount: number;
};

export function adminCoursesKey(params: AdminCoursesParams) {
  return ["admin", "courses", params] as const;
}

export function parseStatus(value: string | null | undefined): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
