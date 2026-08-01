/**
 * Client-safe DTOs for the Mentor surface. Mirrors the shape philosophy of
 * `internship-types.ts`: server-only loaders resolve Prisma data into these
 * plain objects, which are the ONLY thing crossing into client components.
 *
 * Mentors are matched to students through a single Class (PRD §6.9.1) — every
 * figure here is scoped to the mentor's own class.
 */

import type { AttendanceDisplayStatus, TodayOff } from "@/lib/internship-types";

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

/**
 * The mentor's OWN attendance status for today — drives the dashboard hero's
 * check-in CTA. HADIR/BELUM/TIDAK_HADIR mirror the Peserta-Magang tri-state;
 * `off` is non-null on a non-working day (holiday / weekend / out-of-period),
 * which makes the hero render a clear "Libur" state instead of the check-in CTA.
 */
export type MentorSelfAttendance = {
  status: AttendanceDisplayStatus;
  checkInLabel: string | null;
  off: TodayOff | null;
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
  /** Polite honorific from the mentor's gender ("Pak"/"Bu"), or null when unset. */
  honorific: string | null;
  menteeCount: number;
  attendance: MentorAttendanceToday;
  /** The mentor's own attendance today (dashboard hero check-in CTA). */
  selfAttendance: MentorSelfAttendance;
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

// ---- Task detail (one task + its full class submission roster) --------------

/** Display status for a student's submission row (reuses the intern vocab). */
export type MentorSubmissionStatus =
  | "TERKUMPUL"
  | "DIKEMBALIKAN"
  | "BELUM"
  | "TERLEWAT";

/** One student's row in the submission table. Every mentee appears. */
export type MentorSubmissionRow = {
  studentId: string; // user.id — stable key + return target
  name: string;
  image: string | null;
  status: MentorSubmissionStatus;
  submittedAtISO: string | null;
  /** Uploaded submission file (signed Bunny URL) when present. */
  file: { name: string; sizeLabel: string; url: string | null } | null;
  /** Mentor's return note, when the task was sent back. */
  feedbackText: string | null;
};

/** Mentor attachment summary (display name + pre-formatted size). */
export type MentorTaskAttachment = {
  name: string;
  sizeLabel: string;
  /** Signed download URL (null when storage/pull-zone not configured). */
  url: string | null;
};

export type MentorTaskDetail = {
  context: MentorContext;
  task: {
    id: string;
    title: string;
    /** Rich-text HTML with inline images already re-signed for reading. */
    descriptionHtml: string;
    deadlineISO: string;
    attachment: MentorTaskAttachment | null;
  };
  rows: MentorSubmissionRow[];
  summary: { terkumpul: number; total: number };
  /** Server "now" (ISO) for deterministic deadline-derived status on hydration. */
  serverNowISO: string;
};

/** Prefill payload for the edit form page. */
export type MentorTaskEditData = {
  context: MentorContext;
  period: { startISO: string; endISO: string };
  task: {
    id: string;
    title: string;
    descriptionHtml: string;
    /** Wall-clock WIB "yyyy-MM-ddTHH:mm" for the date+time picker. */
    deadlineWib: string;
    attachment: { name: string; sizeLabel: string } | null;
  };
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

// ---- Nilai Akhir (final grade per mentee) -----------------------------------

/** One mentee's final-grade row in the Nilai Akhir table. */
export type MentorGradeRow = {
  studentId: string; // user.id — stable key + mutation target
  name: string; // user.name
  image: string | null; // user.image (preset avatar path) for avatar/initials
  institution: string | null; // university (null = not filled in yet)
  grade: number | null; // 0–100, or null when not graded yet
  note: string | null; // optional mentor note
  gradedAt: string | null; // ISO timestamp of first grading (null = ungraded)
  isLocked: boolean; // true when admin locked the grade
  overrideReason: string | null; // latest admin override reason
};

export type MentorGradesData = {
  context: MentorContext;
  grades: MentorGradeRow[];
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
