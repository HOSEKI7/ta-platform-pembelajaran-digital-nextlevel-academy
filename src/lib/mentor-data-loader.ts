import "server-only";

import { prisma } from "@/lib/prisma";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  computeWindow,
  getWibYmd,
} from "@/components/internship/attendance/attendance-data";
import type {
  MentorActiveTask,
  MentorAttendanceToday,
  MentorContext,
  MentorContextBundle,
  MentorDashboardData,
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
