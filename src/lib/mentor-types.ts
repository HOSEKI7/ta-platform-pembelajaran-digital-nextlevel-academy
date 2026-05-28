/**
 * Client-safe DTOs for the Mentor surface. Mirrors the shape philosophy of
 * `internship-types.ts`: server-only loaders resolve Prisma data into these
 * plain objects, which are the ONLY thing crossing into client components.
 *
 * Mentors are matched to students through a single Class (PRD §6.9.1) — every
 * figure here is scoped to the mentor's own class.
 */

/** Topbar chip / hero identity context, derived from MentorProfile → Class. */
export type MentorContext = {
  batchLabel: string; // e.g. "Batch 1 2026"
  fieldLabel: string; // e.g. "Web Programming"
  section: string; // e.g. "A"
  classFullName: string; // e.g. "Batch 1 - Web Programming - A"
  /** Number of Peserta Magang placed in this class (cap 10). */
  studentCount: number;
};

/** Today's check-in window state for the class (drives the attendance badge). */
export type MentorWindowState =
  | "BEFORE" // window not yet opened
  | "OPEN" // currently open
  | "AFTER" // closed for today
  | "LIBUR" // weekend / holiday
  | "LUAR_PERIODE"; // outside the batch period

/** Class-wide attendance snapshot for today. */
export type MentorAttendanceToday = {
  present: number; // students checked in today
  belum: number; // not yet, window still open / before
  tidakHadir: number; // not checked in and window has closed
  total: number; // students in class
  /** True when today is an eligible working day (in period, not weekend/holiday). */
  isWorkingDay: boolean;
  windowState: MentorWindowState;
  /** Holiday description when windowState is LIBUR due to an admin holiday. */
  holidayLabel: string | null;
};

/** A task whose deadline has not yet passed, with submission progress. */
export type MentorActiveTask = {
  id: string;
  title: string;
  deadlineISO: string;
  submittedCount: number; // submissions with status SUBMITTED
  totalStudents: number;
};

export type MentorDashboardData = {
  context: MentorContext;
  menteeCount: number;
  attendance: MentorAttendanceToday;
  activeTasks: MentorActiveTask[];
  /** Submissions awaiting mentor review (SUBMITTED) across all class tasks. */
  pendingReviewCount: number;
  period: { startISO: string; endISO: string };
};

export type MentorContextBundle = {
  context: MentorContext;
  period: { startISO: string; endISO: string };
};
