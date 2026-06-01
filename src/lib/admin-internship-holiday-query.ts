/**
 * Shared types + query key + pure state machine for the admin "Konfigurasi Jam
 * Kerja dan Libur" surface at `/admin/internship/work-config` (PRD §6.9 / §5.3).
 * Safe to import from both Server and Client Components — keep this file free of
 * any Prisma / server-only imports. The data layer lives in
 * `./admin-internship-holiday-loader.ts`.
 */

export type HolidayRow = {
  id: string;
  description: string;
  /** Date-only ISO "YYYY-MM-DD" (WIB calendar date). */
  startDate: string;
  endDate: string;
  /** Inclusive day count == endDate - startDate + 1. */
  days: number;
  createdAt: string;
};

export type HolidayConfigData = {
  holidays: HolidayRow[];
  /** Server-computed "today" in WIB ("YYYY-MM-DD") — drives the state machine. */
  todayISO: string;
};

export const holidayConfigKey = ["admin", "internship", "holidays"] as const;

/** The active tab — mirrored to the URL `?tab=` for shareable deep links. */
export const WORK_CONFIG_TABS = ["holidays", "window"] as const;
export type WorkConfigTab = (typeof WORK_CONFIG_TABS)[number];

export function parseWorkTab(value: string | null | undefined): WorkConfigTab {
  return WORK_CONFIG_TABS.includes(value as WorkConfigTab)
    ? (value as WorkConfigTab)
    : "holidays";
}

/**
 * Holiday lifecycle relative to today (WIB). Drives both the UI gating and the
 * server-authoritative enforcement (the server recomputes this — never trusts
 * the client). ISO "YYYY-MM-DD" strings compare lexicographically.
 *
 *   UPCOMING (today < start) → full edit + delete
 *   ACTIVE   (start ≤ today ≤ end) → end-early + description only
 *   PAST     (today > end) → read-only
 */
export type HolidayState = "UPCOMING" | "ACTIVE" | "PAST";

export function classifyHolidayState(
  startISO: string,
  endISO: string,
  todayISO: string,
): HolidayState {
  if (todayISO < startISO) return "UPCOMING";
  if (todayISO > endISO) return "PAST";
  return "ACTIVE";
}

export const HOLIDAY_STATE_LABEL: Record<HolidayState, string> = {
  UPCOMING: "Akan Datang",
  ACTIVE: "Berlangsung",
  PAST: "Selesai",
};
