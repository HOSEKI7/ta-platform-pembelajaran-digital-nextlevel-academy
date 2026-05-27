/**
 * Platform-wide internship configuration.
 *
 * The daily check-in window is a GLOBAL setting (one value for every batch — a
 * user decision), so it lives here as a single source of truth rather than as
 * per-batch columns. There is no admin UI to edit it yet; when an admin settings
 * page is built, promote this to a `Setting` row and read it through a loader.
 * Times are "HH:mm" in WIB (UTC+7), matching PRD §6.9.2.
 */
export const INTERNSHIP_CHECKIN_WINDOW = {
  start: "09:00",
  end: "12:00",
} as const;
