import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  computeWindow,
  getWibYmd,
  parseYmd,
  WIB_TZ,
} from "@/components/internship/attendance/attendance-data";
import type {
  MentorActiveTask,
  MentorAttendanceData,
  MentorAttendanceDayKind,
  MentorAttendanceRowStatus,
  MentorAttendanceStudentRow,
  MentorAttendanceToday,
  MentorContext,
  MentorContextBundle,
  MentorDashboardData,
  MentorStudentsData,
  MentorWindowState,
} from "@/lib/mentor-types";

const WINDOW = INTERNSHIP_CHECKIN_WINDOW;

// ---- date-only helpers (DB @db.Date stored as UTC midnight) -----------------
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}
function isoKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function dbDateToISO(d: Date): string {
  return isoKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
/** Day-of-week via UTC-noon to avoid timezone edge shifts. 0 = Sunday. */
function weekdayUtc(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day, 12)).getUTCDay();
}

type Ymd = { year: number; month: number; day: number };
function compareYmd(a: Ymd, b: Ymd): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

// ---- mentor profile (single org-chain read; reused by every loader) ---------
type MentorProfileRow = {
  classId: string;
  className: string;
  fieldName: string;
  batchName: string;
  startDate: Date;
  endDate: Date;
};

async function fetchMentorProfile(
  userId: string,
): Promise<MentorProfileRow | null> {
  const p = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: {
      classId: true,
      class: {
        select: {
          name: true,
          field: {
            select: {
              name: true,
              batch: { select: { name: true, startDate: true, endDate: true } },
            },
          },
        },
      },
    },
  });
  if (!p) return null;
  return {
    classId: p.classId,
    className: p.class.name,
    fieldName: p.class.field.name,
    batchName: p.class.field.batch.name,
    startDate: p.class.field.batch.startDate,
    endDate: p.class.field.batch.endDate,
  };
}

function toContext(p: MentorProfileRow, studentCount: number): MentorContext {
  const parts = p.className.split(" - ");
  return {
    batchLabel: p.batchName,
    // "Batch 1 - Web Programming" → "Web Programming"
    fieldLabel: p.fieldName.split(" - ").slice(1).join(" - ") || p.fieldName,
    section: parts[parts.length - 1] ?? p.className,
    classFullName: p.className,
    studentCount,
  };
}

/** Topbar chip / layout context. `null` when the mentor isn't assigned a class. */
export async function loadMentorContext(
  userId: string,
): Promise<MentorContextBundle | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;
  const studentCount = await prisma.internshipProfile.count({
    where: { classId: p.classId },
  });
  return {
    context: toContext(p, studentCount),
    period: { startISO: dbDateToISO(p.startDate), endISO: dbDateToISO(p.endDate) },
  };
}

// ---- daftar peserta (class-scoped mentee roster: name + university) ---------
export async function loadMentorStudents(
  userId: string,
): Promise<MentorStudentsData | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  // Single query (no N+1): pull every mentee in the class with the user fields
  // the roster needs, ordered by name for a stable, readable list.
  const rows = await prisma.internshipProfile.findMany({
    where: { classId: p.classId },
    select: {
      id: true,
      institution: true,
      user: { select: { name: true, image: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return {
    context: toContext(p, rows.length),
    students: rows.map((r) => ({
      id: r.id,
      name: r.user.name,
      institution: r.institution,
      image: r.user.image,
    })),
  };
}

// ---- dashboard (class-scoped: mentees + today attendance + active tasks) ----
export async function loadMentorDashboard(
  userId: string,
): Promise<MentorDashboardData | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  const now = new Date();
  const today = getWibYmd(now.toISOString());
  const todayDate = utcDate(today.year, today.month, today.day);
  const periodStart: Ymd = {
    year: p.startDate.getUTCFullYear(),
    month: p.startDate.getUTCMonth(),
    day: p.startDate.getUTCDate(),
  };
  const periodEnd: Ymd = {
    year: p.endDate.getUTCFullYear(),
    month: p.endDate.getUTCMonth(),
    day: p.endDate.getUTCDate(),
  };

  const [menteeCount, presentToday, holiday, taskRows] = await Promise.all([
    prisma.internshipProfile.count({ where: { classId: p.classId } }),
    prisma.attendance.count({
      where: {
        status: "PRESENT",
        date: todayDate,
        user: { internshipProfile: { classId: p.classId } },
      },
    }),
    prisma.holiday.findFirst({
      where: { startDate: { lte: todayDate }, endDate: { gte: todayDate } },
      select: { description: true },
    }),
    prisma.task.findMany({
      where: { classId: p.classId },
      select: {
        id: true,
        title: true,
        deadline: true,
        submissions: { select: { status: true } },
      },
      orderBy: { deadline: "asc" },
    }),
  ]);

  // ---- today attendance state ----
  const inPeriod =
    compareYmd(today, periodStart) >= 0 && compareYmd(today, periodEnd) <= 0;
  const dow = weekdayUtc(today.year, today.month, today.day);
  const isWeekend = dow === 0 || dow === 6;
  const isHoliday = Boolean(holiday);
  const isWorkingDay = inPeriod && !isWeekend && !isHoliday;

  const win = computeWindow(now, WINDOW).state; // BEFORE | OPEN | AFTER
  let windowState: MentorWindowState;
  if (!inPeriod) windowState = "LUAR_PERIODE";
  else if (isWeekend || isHoliday) windowState = "LIBUR";
  else windowState = win;

  const present = isWorkingDay ? presentToday : 0;
  const remaining = Math.max(0, menteeCount - present);
  // After the window closes, the un-checked-in are absent; before/during, "belum".
  const tidakHadir = isWorkingDay && windowState === "AFTER" ? remaining : 0;
  const belum = isWorkingDay && windowState !== "AFTER" ? remaining : 0;

  const attendance: MentorAttendanceToday = {
    present,
    belum,
    tidakHadir,
    total: menteeCount,
    isWorkingDay,
    windowState,
    holidayLabel: holiday?.description ?? null,
  };

  // ---- active tasks (deadline not yet passed) + review backlog ----
  const activeTasks: MentorActiveTask[] = [];
  let pendingReviewCount = 0;
  for (const t of taskRows) {
    const submittedCount = t.submissions.filter(
      (s) => s.status === "SUBMITTED",
    ).length;
    pendingReviewCount += submittedCount;
    if (t.deadline.getTime() >= now.getTime()) {
      activeTasks.push({
        id: t.id,
        title: t.title,
        deadlineISO: t.deadline.toISOString(),
        submittedCount,
        totalStudents: menteeCount,
      });
    }
  }

  return {
    context: toContext(p, menteeCount),
    menteeCount,
    attendance,
    activeTasks,
    pendingReviewCount,
    period: { startISO: dbDateToISO(p.startDate), endISO: dbDateToISO(p.endDate) },
  };
}

// ---- absensi peserta (class-scoped roster for ONE selected date, read-only) -
/**
 * Resolve the whole class's attendance for a single date. Mirrors the read-time
 * derivation used elsewhere (only PRESENT rows exist; absence is computed):
 *   PRESENT row → HADIR (+ check-in time) · else today before window close →
 *   BELUM · else (past working day, or today after close) → TIDAK_HADIR.
 * On weekends / holidays / out-of-period days no attendance is expected, so the
 * roster carries every mentee with a neutral status and the UI shows a banner.
 * Returns `null` when the mentor isn't assigned a class.
 */
export async function loadMentorAttendanceByDate(
  userId: string,
  dateISO: string,
): Promise<MentorAttendanceData | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  const now = new Date();
  const today = getWibYmd(now.toISOString());
  const sel = parseYmd(dateISO);
  const selDate = utcDate(sel.year, sel.month, sel.day);

  const periodStart: Ymd = {
    year: p.startDate.getUTCFullYear(),
    month: p.startDate.getUTCMonth(),
    day: p.startDate.getUTCDate(),
  };
  const periodEnd: Ymd = {
    year: p.endDate.getUTCFullYear(),
    month: p.endDate.getUTCMonth(),
    day: p.endDate.getUTCDate(),
  };

  const [students, attendance, holiday] = await Promise.all([
    prisma.internshipProfile.findMany({
      where: { classId: p.classId },
      select: {
        id: true,
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.attendance.findMany({
      where: {
        status: "PRESENT",
        date: selDate,
        user: { internshipProfile: { classId: p.classId } },
      },
      select: { userId: true, checkedInAt: true },
    }),
    prisma.holiday.findFirst({
      where: { startDate: { lte: selDate }, endDate: { gte: selDate } },
      select: { description: true },
    }),
  ]);

  // userId → check-in time "HH:mm" WIB.
  const presentMap = new Map<string, string>();
  for (const a of attendance) {
    presentMap.set(
      a.userId,
      a.checkedInAt ? formatInTimeZone(a.checkedInAt, WIB_TZ, "HH:mm") : "—:—",
    );
  }

  // Day classification (same precedence as the calendar engine).
  const inPeriod =
    compareYmd(sel, periodStart) >= 0 && compareYmd(sel, periodEnd) <= 0;
  const dow = weekdayUtc(sel.year, sel.month, sel.day);
  const isWeekend = dow === 0 || dow === 6;
  const isHoliday = Boolean(holiday);
  let kind: MentorAttendanceDayKind;
  if (!inPeriod) kind = "LUAR_PERIODE";
  else if (isWeekend || isHoliday) kind = "LIBUR";
  else kind = "WORKING";

  const isToday = compareYmd(sel, today) === 0;
  const windowClosedToday = computeWindow(now, WINDOW).state === "AFTER";

  // Window badge state — only meaningful when the selected date is today.
  let windowState: MentorWindowState;
  if (!inPeriod) windowState = "LUAR_PERIODE";
  else if (isWeekend || isHoliday) windowState = "LIBUR";
  else if (isToday) windowState = computeWindow(now, WINDOW).state;
  else windowState = "AFTER"; // a settled past working day

  let present = 0;
  let belum = 0;
  let tidakHadir = 0;

  const rows: MentorAttendanceStudentRow[] = students.map((s) => {
    const checkInTime = presentMap.get(s.user.id) ?? null;
    let status: MentorAttendanceRowStatus;

    if (kind !== "WORKING") {
      // No attendance expected; only surface a real PRESENT row if one exists.
      status = checkInTime ? "HADIR" : "BELUM";
    } else if (checkInTime) {
      status = "HADIR";
      present += 1;
    } else if (isToday && !windowClosedToday) {
      status = "BELUM";
      belum += 1;
    } else {
      status = "TIDAK_HADIR";
      tidakHadir += 1;
    }

    return {
      id: s.id,
      name: s.user.name,
      image: s.user.image,
      status,
      checkInTime: status === "HADIR" ? checkInTime : null,
    };
  });

  return {
    context: toContext(p, students.length),
    period: { startISO: dbDateToISO(p.startDate), endISO: dbDateToISO(p.endDate) },
    serverNowISO: now.toISOString(),
    day: {
      dateISO,
      kind,
      holidayLabel: holiday?.description ?? null,
      isToday,
      windowState,
      summary: { present, belum, tidakHadir, total: students.length },
      rows,
    },
  };
}
