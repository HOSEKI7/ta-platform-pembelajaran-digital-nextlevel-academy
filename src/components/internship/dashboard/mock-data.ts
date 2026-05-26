/**
 * Static mock for the Peserta-Magang dashboard (UI-only pass — no backend yet).
 * Types are shaped so real Prisma loaders can drop in later without touching the
 * components. The topbar class chip reads `MOCK_MAGANG_CONTEXT` from here too, so
 * the demo has a single source of truth.
 */

/** Today's attendance display state — tri-state per PRD §6.9.2 (DB only stores
 *  PRESENT/ABSENT; "BELUM" is the derived in-window UI state for today). */
export type AttendanceDisplayStatus = "HADIR" | "BELUM" | "TIDAK_HADIR";

export type MagangContext = {
  /** e.g. "Batch 1 2025" */
  batchLabel: string;
  /** e.g. "Web Programming" */
  fieldLabel: string;
  /** Class section, e.g. "A" */
  section: string;
  /** Full class name as stored, e.g. "Batch 1 - Web Programming - A" */
  classFullName: string;
  mentorName: string;
  institution: string | null;
};

/** Daily check-in window, "HH:mm" in WIB. Admin-configured in the real system. */
export type AttendanceWindow = { start: string; end: string };

export type MonthSummary = {
  presentDays: number;
  totalDays: number;
  /** Consecutive present days up to today. */
  streakDays: number;
};

export type DayMark = {
  /** Short weekday label, e.g. "Sen". */
  label: string;
  status: AttendanceDisplayStatus;
};

export type PendingTask = {
  id: string;
  title: string;
  deadlineISO: string;
  status: "NOT_SUBMITTED" | "SUBMITTED";
};

export const MOCK_MAGANG_CONTEXT: MagangContext = {
  batchLabel: "Batch 1 2025",
  fieldLabel: "Web Programming",
  section: "A",
  classFullName: "Batch 1 - Web Programming - A",
  mentorName: "Aldi Pratama",
  institution: "Universitas Negeri Surabaya",
};

export const MOCK_ATTENDANCE_WINDOW: AttendanceWindow = {
  start: "09:00",
  end: "12:00",
};

export const MOCK_MONTH_SUMMARY: MonthSummary = {
  presentDays: 18,
  totalDays: 20,
  streakDays: 4,
};

/** Last 7 days (oldest → newest); the final entry is today (still "BELUM"). */
export const MOCK_LAST7: DayMark[] = [
  { label: "Sen", status: "HADIR" },
  { label: "Sel", status: "HADIR" },
  { label: "Rab", status: "TIDAK_HADIR" },
  { label: "Kam", status: "HADIR" },
  { label: "Jum", status: "HADIR" },
  { label: "Sab", status: "HADIR" },
  { label: "Min", status: "BELUM" },
];

/**
 * Build pending tasks with deadlines relative to `now` so urgency badges render
 * realistically. Called on the server (page) and passed down as ISO strings to
 * keep formatting deterministic across the hydration boundary.
 */
export function buildMockPendingTasks(now: Date): PendingTask[] {
  const hours = (h: number) => new Date(now.getTime() + h * 3_600_000).toISOString();
  return [
    {
      id: "tsk_setup_db",
      title: "Setup Database & Prisma Schema",
      deadlineISO: hours(5),
      status: "NOT_SUBMITTED",
    },
    {
      id: "tsk_landing_slice",
      title: "Slicing Halaman Landing Page",
      deadlineISO: hours(28),
      status: "NOT_SUBMITTED",
    },
    {
      id: "tsk_weekly_report",
      title: "Laporan Mingguan — Sprint 2",
      deadlineISO: hours(72),
      status: "NOT_SUBMITTED",
    },
  ];
}
