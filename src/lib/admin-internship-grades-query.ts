/**
 * Shared types + query-key factory + URL parsers for the admin internship final
 * grade page (PRD §6.11.9 / §6.9.4):
 *   /admin/internship/grades   (daftar nilai akhir lintas kelas + override admin)
 *
 * Safe to import from both Server Components and Client Components — keep this
 * file free of any Prisma / server-only imports. The data layer lives in
 * `./admin-internship-grades-loader.ts` and `./admin-final-grade-write.ts`.
 *
 * The cascading Batch → Field → Class filter reuses the attendance filter
 * endpoint/hook, so its option types + the generic id/page/search parsers are
 * re-exported from `./admin-internship-attendance-query`.
 */

export { parseId, parsePage, parseSearch } from "@/lib/admin-internship-attendance-query";
export type { AttendanceFilterOptions } from "@/lib/admin-internship-attendance-query";

export const PAGE_SIZE = 10;

export type AdminGradeListParams = {
  search: string;
  /** Filter ids — empty string = unfiltered ("all"). */
  batchId: string;
  fieldId: string;
  classId: string;
  page: number;
};

/** One intern row in the grade-management list. */
export type AdminGradeRow = {
  studentId: string;
  name: string;
  image: string | null;
  /** "Batch - Bidang - Kelas". */
  classLabel: string;
  institution: string | null;
  /** Null while no one has graded yet. */
  grade: number | null;
  /** Letter band (A / A- / … / E) derived from the score; null when ungraded. */
  letter: string | null;
  /** First time a grade was set (server-stored). Null when ungraded. */
  gradedAtISO: string | null;
  /** True when admin locked the grade against mentor edits. */
  isLocked: boolean;
};

export type AdminGradeListResult = {
  rows: AdminGradeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function adminGradesKey(params: AdminGradeListParams) {
  return ["admin", "internship-grades", params] as const;
}

export const ADMIN_GRADES_ROOT_KEY = ["admin", "internship-grades"] as const;
