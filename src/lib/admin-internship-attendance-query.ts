/**
 * Shared types + query-key factory + URL parsers for the admin internship
 * attendance management pages (PRD §6.11 / §6.9.2):
 *   /admin/internship/mentor-attendance   (scope "mentor")
 *   /admin/internship/student-attendance   (scope "student")
 *
 * Safe to import from both Server Components and Client Components — keep this
 * file free of any Prisma / server-only imports. The data layer lives in
 * `./admin-internship-attendance-loader.ts` and `./admin-attendance-write.ts`.
 */

import type { MentorAttendanceRowStatus } from "@/lib/mentor-types";

export const PAGE_SIZE = 10;

/** Which roster a page manages. */
export type AttendanceScope = "mentor" | "student";

/** Per-row attendance status on the selected date (reuses the mentor union). */
export type AdminAttendanceStatus = MentorAttendanceRowStatus; // "HADIR" | "BELUM" | "TIDAK_HADIR"

/** Day classification for the selected date (drives the banner + editability). */
export type AttendanceDayKind = "WORKING" | "LIBUR" | "LUAR_PERIODE";

/** Mutable target status an admin can set (BELUM is derived, never written). */
export type SettableStatus = "HADIR" | "TIDAK_HADIR";

export type AdminAttendanceParams = {
  scope: AttendanceScope;
  /** Selected date "yyyy-MM-dd" (WIB calendar date). */
  dateISO: string;
  /** Filter ids — empty string = unfiltered ("all"). */
  batchId: string;
  fieldId: string;
  classId: string;
  search: string;
  page: number;
};

/** One mentor/intern row on the selected date. */
export type AdminAttendanceRow = {
  userId: string;
  name: string;
  image: string | null;
  /** "Batch - Field - Class". */
  classLabel: string;
  status: AdminAttendanceStatus;
  /** Check-in time "HH:mm" WIB when HADIR, else null ("—"). */
  checkInTime: string | null;
  /** True only on a working day on/before today — gates the action buttons. */
  editable: boolean;
};

export type AdminAttendanceResult = {
  rows: AdminAttendanceRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  day: {
    dateISO: string;
    kind: AttendanceDayKind;
    /** Holiday description when kind is LIBUR due to an admin holiday. */
    holidayLabel: string | null;
  };
  serverNowISO: string;
};

/** Dropdown options for the cascading Batch → Field → Class filter. */
export type AttendanceFilterOptions = {
  batches: { id: string; name: string }[];
  fields: { id: string; name: string; batchId: string }[];
  classes: { id: string; name: string; fieldId: string }[];
  /** Earliest navigable date (earliest batch start) "yyyy-MM-dd". */
  minDateISO: string;
};

export function adminAttendanceKey(params: AdminAttendanceParams) {
  return ["admin", "internship-attendance", params] as const;
}

export const attendanceFiltersKey = ["admin", "internship-attendance", "filters"] as const;

export const SCOPES = ["mentor", "student"] as const;

export function parseScope(value: string | null | undefined): AttendanceScope {
  return value === "mentor" ? "mentor" : "student";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}

/** A cuid-ish filter id, or "" when absent/blank (treated as "all"). */
export function parseId(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 40);
}
