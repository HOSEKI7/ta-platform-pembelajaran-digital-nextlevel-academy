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

/**
 * One class task in the mentor's "Kelola Tugas" list. Unlike `MentorActiveTask`
 * (dashboard, active only), this covers every task — upcoming and past — with
 * its submission progress so the list can show "x/total siswa".
 */
export type MentorTaskRow = {
  id: string;
  title: string;
  deadlineISO: string;
  /** Submissions with status SUBMITTED (matches dashboard convention). */
  submittedCount: number;
  /** Peserta Magang in the class (cap 10). */
  totalStudents: number;
  /** Whether a mentor attachment is set (drives the footer label). */
  hasAttachment: boolean;
};

export type MentorTasksData = {
  context: MentorContext;
  tasks: MentorTaskRow[];
  /** Server "now" (ISO) so urgency / split math is deterministic on hydration. */
  serverNowISO: string;
};

/** A single mentee in the mentor's class (Daftar Peserta). */
export type MentorStudentRow = {
  id: string; // InternshipProfile.id
  name: string; // user.name
  institution: string | null; // university (null = not filled in yet)
  image: string | null; // user.image (preset avatar path) for avatar/initials
};

export type MentorStudentsData = {
  context: MentorContext;
  students: MentorStudentRow[];
};

/** Per-student attendance status for a single selected date (read-only). */
export type MentorAttendanceRowStatus = "HADIR" | "BELUM" | "TIDAK_HADIR";

/** One mentee's attendance on the selected date. */
export type MentorAttendanceStudentRow = {
  id: string; // InternshipProfile.id — stable key
  name: string; // user.name
  image: string | null; // user.image (preset avatar path) for avatar/initials
  status: MentorAttendanceRowStatus;
  /** Check-in time "HH:mm" WIB when HADIR, else null ("—"). */
  checkInTime: string | null;
};

/**
 * The nature of the selected date — decides whether the roster shows live
 * attendance (WORKING) or a "no attendance expected" banner.
 */
export type MentorAttendanceDayKind = "WORKING" | "LIBUR" | "LUAR_PERIODE";

/** Class-wide attendance for one selected date. */
export type MentorAttendanceDay = {
  dateISO: string; // selected date "yyyy-MM-dd" (WIB)
  kind: MentorAttendanceDayKind;
  /** Holiday description when kind is LIBUR due to an admin holiday. */
  holidayLabel: string | null;
  isToday: boolean;
  /** Only meaningful when isToday — drives the live window badge. */
  windowState: MentorWindowState;
  /** Tallies (all 0 except total when kind !== WORKING). */
  summary: { present: number; belum: number; tidakHadir: number; total: number };
  /** Every mentee in the class, ordered by name. */
  rows: MentorAttendanceStudentRow[];
};

export type MentorAttendanceData = {
  context: MentorContext;
  period: { startISO: string; endISO: string };
  /** Server "now" (ISO) so the live badge's first client render matches SSR. */
  serverNowISO: string;
  day: MentorAttendanceDay;
};
