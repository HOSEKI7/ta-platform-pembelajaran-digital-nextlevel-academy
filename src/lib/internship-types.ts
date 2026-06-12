/**
 * Client-safe shared types for the Peserta-Magang surface (dashboard +
 * attendance). No `server-only` here — both the server loaders
 * (`internship-data-loader.ts`) and the client components import these, so they
 * stay in sync. Replaces the old `dashboard/mock-data.ts`.
 */

/** Today / last-7 tri-state. The DB only stores PRESENT/ABSENT; "BELUM" is the
 *  derived in-window UI state for today. */
export type AttendanceDisplayStatus = "HADIR" | "BELUM" | "TIDAK_HADIR";

/** Last-7-days strip status — adds LIBUR for weekend/holiday days. */
export type Last7Status = AttendanceDisplayStatus | "LIBUR";

/** Why today is not a check-in day (a non-working day). */
export type AttendanceOffReason = "HOLIDAY" | "WEEKEND" | "LUAR_PERIODE";

/**
 * Today's "off" descriptor — orthogonal to the tri-state. `null` means today is
 * an eligible working day (check-in relevant); non-null marks a holiday / weekend
 * / out-of-period day so the UI can show a clear "Libur" state instead of the
 * check-in panel.
 */
export type TodayOff = {
  reason: AttendanceOffReason;
  /** Holiday description (only when reason === "HOLIDAY"), else null. */
  label: string | null;
};

export type MagangContext = {
  /** e.g. "Batch 1 2026" */
  batchLabel: string;
  /** e.g. "Web Programming" */
  fieldLabel: string;
  /** Class section letter, e.g. "A" */
  section: string;
  /** Full class name as stored, e.g. "Batch 1 - Web Programming - A" */
  classFullName: string;
  mentorName: string;
  institution: string | null;
};

/** Daily check-in window, "HH:mm" in WIB (global — see internship-config.ts). */
export type AttendanceWindow = { start: string; end: string };

/** Internship period (date-only "yyyy-MM-dd", WIB) — bounds the calendar. */
export type InternshipPeriod = { startISO: string; endISO: string };

/** Context bundle returned by the loader; null when the user isn't placed. */
export type MagangContextBundle = {
  context: MagangContext;
  period: InternshipPeriod;
};

/** Holiday input shape (admin span). Expanded to dates by `expandHolidays`. */
export type Holiday = { startISO: string; days: number; description: string };

export type MonthSummary = {
  presentDays: number;
  totalDays: number;
  /** Consecutive present working days up to the latest recorded day. */
  streakDays: number;
};

export type DayMark = {
  /** Short weekday label, e.g. "Sen". */
  label: string;
  status: Last7Status;
};

export type PendingTask = {
  id: string;
  title: string;
  deadlineISO: string;
  status: "NOT_SUBMITTED" | "SUBMITTED";
};

// ---- Calendar grid ----------------------------------------------------------

/**
 * Calendar cell status. Superset of the tri-state: adds LIBUR (weekend /
 * holiday), FUTURE (upcoming within period) and LUAR_PERIODE (outside the
 * internship period — not counted).
 */
export type CalendarDayStatus =
  | "HADIR"
  | "TIDAK_HADIR"
  | "BELUM"
  | "LIBUR"
  | "FUTURE"
  | "LUAR_PERIODE";

export type CalendarDay = {
  /** Day-of-month (1..31), or null for leading/trailing padding cells. */
  day: number | null;
  status: CalendarDayStatus | null;
  /** "yyyy-MM-dd" for real cells. */
  dateISO?: string;
  /** Check-in time "HH:mm" for HADIR days. */
  checkInTime?: string;
  /** Holiday description for LIBUR-by-holiday days (tooltip). */
  holidayLabel?: string;
  isToday?: boolean;
};

/** A fully-resolved month grid (server-computed from real Attendance data). */
export type AttendanceMonthDTO = {
  year: number;
  /** 0-based month index. */
  month: number;
  /** Flat cell list including padding; length is a multiple of 7. */
  cells: CalendarDay[];
  hadir: number;
  tidakHadir: number;
};
