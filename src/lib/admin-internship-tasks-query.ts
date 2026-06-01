/**
 * Shared types + query-key factory + URL parsers for the admin internship task
 * management pages (PRD §6.11 / §6.9.3):
 *   /admin/internship/tasks            (daftar tugas lintas kelas)
 *   /admin/internship/tasks/[taskId]   (detail + tabel pengumpulan)
 *
 * Safe to import from both Server Components and Client Components — keep this
 * file free of any Prisma / server-only imports. The data layer lives in
 * `./admin-internship-tasks-loader.ts` and `./admin-task-submission-write.ts`.
 *
 * The cascading Batch → Field → Class filter reuses the attendance filter
 * endpoint/hook, so its option types + the generic id/page/search parsers are
 * re-exported from `./admin-internship-attendance-query`.
 */

import type { TaskDisplayStatus } from "@/lib/internship-task-types";

export { parseId, parsePage, parseSearch } from "@/lib/admin-internship-attendance-query";
export type { AttendanceFilterOptions } from "@/lib/admin-internship-attendance-query";

export const PAGE_SIZE = 10;

/** Lifecycle status of a task, derived from its deadline vs. server now. */
export type AdminTaskStatus = "AKTIF" | "OVERDUE";

/** Raw submission state an admin can force a row into (BELUM is derived). */
export type ForceSubmissionStatus = "SUBMITTED" | "NOT_SUBMITTED";

export type AdminTaskListParams = {
  search: string;
  /** Filter ids — empty string = unfiltered ("all"). */
  batchId: string;
  fieldId: string;
  classId: string;
  /** "" = semua status. */
  status: "" | AdminTaskStatus;
  page: number;
};

/** One task row in the management list. */
export type AdminTaskRow = {
  id: string;
  title: string;
  /** "Batch - Bidang - Kelas". */
  classLabel: string;
  createdAtISO: string;
  deadlineISO: string;
  status: AdminTaskStatus;
};

export type AdminTaskListResult = {
  rows: AdminTaskRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  serverNowISO: string;
};

/** A student's submission row inside the task detail roster. */
export type AdminSubmissionRow = {
  studentId: string;
  name: string;
  image: string | null;
  /** Display status (TERKUMPUL / DIKEMBALIKAN / TERLEWAT / BELUM). */
  status: TaskDisplayStatus;
  /** The underlying stored status — drives which force-toggle to offer. */
  rawStatus: ForceSubmissionStatus;
  submittedAtISO: string | null;
  file: { name: string; sizeLabel: string; url: string | null } | null;
};

export type AdminTaskDetail = {
  task: {
    id: string;
    title: string;
    descriptionHtml: string;
    deadlineISO: string;
    createdAtISO: string;
    classLabel: string;
    attachment: { name: string; sizeLabel: string; url: string | null } | null;
  };
  rows: AdminSubmissionRow[];
  summary: { terkumpul: number; total: number };
  serverNowISO: string;
};

export function adminTasksKey(params: AdminTaskListParams) {
  return ["admin", "internship-tasks", params] as const;
}

export const ADMIN_TASKS_ROOT_KEY = ["admin", "internship-tasks"] as const;

/** Parse the status filter; anything unknown → "" (semua). */
export function parseTaskStatus(value: string | null | undefined): "" | AdminTaskStatus {
  return value === "AKTIF" || value === "OVERDUE" ? value : "";
}
