/**
 * Shared types + query key for the admin "Konfigurasi Magang" surface at
 * `/admin/internship/config`. Safe to import from both Server and Client
 * Components — keep this file free of any Prisma / server-only imports. The data
 * layer lives in `./admin-internship-config-loader.ts`.
 *
 * The three lists (Batch / Bidang / Kelas) are small, so the loader ships them
 * whole in one payload and the view sorts client-side.
 */

export type BatchRow = {
  id: string;
  name: string;
  description: string;
  /** Date-only ISO "YYYY-MM-DD" (WIB calendar date). */
  startDate: string;
  endDate: string;
  /** Number of Bidang under this batch. */
  fieldCount: number;
  createdAt: string;
};

export type FieldRow = {
  id: string;
  name: string;
  batchId: string;
  batchName: string;
  /** Number of Kelas under this field. */
  classCount: number;
  createdAt: string;
};

export type ClassRow = {
  id: string;
  /** Stored composite name, e.g. "Batch 1 - Web Programming - A". */
  name: string;
  /** Display letter (trailing segment of `name`), e.g. "A". */
  letter: string;
  fieldId: string;
  fieldName: string;
  batchId: string;
  batchName: string;
  maxStudents: number;
  /** Current enrolled intern count. */
  studentCount: number;
  createdAt: string;
};

export type InternshipConfigData = {
  batches: BatchRow[];
  fields: FieldRow[];
  classes: ClassRow[];
};

export const internshipConfigKey = ["admin", "internship", "config"] as const;

/** The active tab — mirrored to the URL `?tab=` for shareable deep links. */
export const CONFIG_TABS = ["batch", "fields", "classes"] as const;
export type ConfigTab = (typeof CONFIG_TABS)[number];

export function parseTab(value: string | null | undefined): ConfigTab {
  return CONFIG_TABS.includes(value as ConfigTab)
    ? (value as ConfigTab)
    : "batch";
}
