import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  WIB_TZ,
  buildMonthFromData,
  computeWindow,
  expandHolidays,
  getWibYmd,
} from "@/components/internship/attendance/attendance-data";
import type {
  AttendanceMonthDTO,
  AttendanceWindow,
  DayMark,
  Last7Status,
  MagangContext,
  MagangContextBundle,
  MonthSummary,
  PendingTask,
} from "@/lib/internship-types";

const WINDOW: AttendanceWindow = INTERNSHIP_CHECKIN_WINDOW;

// Sunday-first weekday labels keyed by JS getUTCDay() (0 = Sunday).
const DOW_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

// ---- date-only helpers (DB @db.Date stored as UTC midnight) -----------------
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}
/** "yyyy-MM-dd" key matching attendance-data's internal format. */
function isoKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function dbDateToISO(d: Date): string {
  return isoKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
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

// ---- profile (the single org-chain read; reused by every loader) ------------
type ProfileRow = {
  classId: string;
  institution: string | null;
  className: string;
  fieldName: string;
  batchName: string;
  startDate: Date;
  endDate: Date;
  mentorName: string | null;
};

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const p = await prisma.internshipProfile.findUnique({
    where: { userId },
    select: {
      classId: true,
      institution: true,
      class: {
        select: {
          name: true,
          field: {
            select: {
              name: true,
              batch: { select: { name: true, startDate: true, endDate: true } },
            },
          },
          mentorProfiles: {
            take: 1,
            select: { user: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!p) return null;
  return {
    classId: p.classId,
    institution: p.institution,
    className: p.class.name,
    fieldName: p.class.field.name,
    batchName: p.class.field.batch.name,
    startDate: p.class.field.batch.startDate,
    endDate: p.class.field.batch.endDate,
    mentorName: p.class.mentorProfiles[0]?.user.name ?? null,
  };
}

function toContext(p: ProfileRow): MagangContext {
  const parts = p.className.split(" - ");
  return {
    batchLabel: p.batchName,
    // "Batch 1 - Web Programming" → "Web Programming"
    fieldLabel: p.fieldName.split(" - ").slice(1).join(" - ") || p.fieldName,
    section: parts[parts.length - 1] ?? p.className,
    classFullName: p.className,
    mentorName: p.mentorName ?? "Belum ditentukan",
    institution: p.institution,
  };
}

/** Class chip / placement context. `null` when the user isn't placed yet. */
export async function loadMagangContext(
  userId: string,
): Promise<MagangContextBundle | null> {
  const p = await fetchProfile(userId);
  if (!p) return null;
  return {
    context: toContext(p),
    period: { startISO: dbDateToISO(p.startDate), endISO: dbDateToISO(p.endDate) },
  };
}

// ---- attendance month (calendar grid for an arbitrary month) ----------------
export async function loadAttendanceMonth(
  userId: string,
  year: number,
  month: number,
): Promise<AttendanceMonthDTO | null> {
  const p = await fetchProfile(userId);
  if (!p) return null;

  const monthStart = utcDate(year, month, 1);
  const monthEnd = utcDate(year, month + 1, 0);

  const [attendance, holidays] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId, status: "PRESENT", date: { gte: monthStart, lte: monthEnd } },
      select: { date: true, checkedInAt: true },
    }),
    prisma.holiday.findMany({
      where: { startDate: { lte: monthEnd }, endDate: { gte: monthStart } },
      select: { startDate: true, days: true, description: true },
    }),
  ]);

  const presentMap = new Map<string, string>();
  for (const a of attendance) {
    presentMap.set(
      dbDateToISO(a.date),
      a.checkedInAt ? formatInTimeZone(a.checkedInAt, WIB_TZ, "HH:mm") : "—:—",
    );
  }
  const holidayMap = expandHolidays(
    holidays.map((h) => ({
      startISO: dbDateToISO(h.startDate),
      days: h.days,
      description: h.description,
    })),
  );

  const now = new Date();
  const windowClosedToday = computeWindow(now, WINDOW).state === "AFTER";

  return buildMonthFromData(year, month, now.toISOString(), {
    periodStartISO: dbDateToISO(p.startDate),
    periodEndISO: dbDateToISO(p.endDate),
    holidayMap,
    presentMap,
    windowClosedToday,
  });
}

// ---- dashboard (context + today + month recap + last7 + tasks) --------------
export type InternshipDashboardDTO = {
  context: MagangContext;
  period: { startISO: string; endISO: string };
  window: AttendanceWindow;
  todayStatus: "HADIR" | "BELUM" | "TIDAK_HADIR";
  todayCheckInLabel: string | null;
  /** Server fact: today is a working day inside the period and not a holiday. */
  todayCheckable: boolean;
  monthSummary: MonthSummary;
  last7: DayMark[];
  tasks: PendingTask[];
};

export async function loadDashboardData(
  userId: string,
): Promise<InternshipDashboardDTO | null> {
  const p = await fetchProfile(userId);
  if (!p) return null;

  const now = new Date();
  const today = getWibYmd(now.toISOString()); // { year, month, day }
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

  // Range covering the current month AND the trailing 7 days, fetched once.
  const monthStart = utcDate(today.year, today.month, 1);
  const last7Start = utcDate(today.year, today.month, today.day - 6);
  const rangeStart = last7Start < monthStart ? last7Start : monthStart;
  const rangeEnd = utcDate(today.year, today.month, today.day);

  const [attendance, holidays, taskRows] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId, status: "PRESENT", date: { gte: rangeStart, lte: rangeEnd } },
      select: { date: true, checkedInAt: true },
    }),
    prisma.holiday.findMany({
      where: { startDate: { lte: rangeEnd }, endDate: { gte: rangeStart } },
      select: { startDate: true, days: true, description: true },
    }),
    prisma.task.findMany({
      where: {
        classId: p.classId,
        submissions: { some: { studentId: userId, status: "NOT_SUBMITTED" } },
      },
      select: { id: true, title: true, deadline: true },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
  ]);

  const presentMap = new Map<string, string>();
  for (const a of attendance) {
    presentMap.set(
      dbDateToISO(a.date),
      a.checkedInAt ? formatInTimeZone(a.checkedInAt, WIB_TZ, "HH:mm") : "—:—",
    );
  }
  const holidaySet = new Set(
    expandHolidays(
      holidays.map((h) => ({
        startISO: dbDateToISO(h.startDate),
        days: h.days,
        description: h.description,
      })),
    ).keys(),
  );

  const windowClosedToday = computeWindow(now, WINDOW).state === "AFTER";

  const isWorkingDay = (ymd: Ymd): boolean => {
    if (compareYmd(ymd, periodStart) < 0 || compareYmd(ymd, periodEnd) > 0) return false;
    const dow = weekdayUtc(ymd.year, ymd.month, ymd.day);
    if (dow === 0 || dow === 6) return false;
    return !holidaySet.has(isoKey(ymd.year, ymd.month, ymd.day));
  };

  /** Resolve a single day to its display status (HADIR/BELUM/TIDAK_HADIR/LIBUR). */
  const resolve = (ymd: Ymd): Last7Status => {
    if (!isWorkingDay(ymd)) return "LIBUR";
    if (presentMap.has(isoKey(ymd.year, ymd.month, ymd.day))) return "HADIR";
    const cmp = compareYmd(ymd, today);
    if (cmp === 0) return windowClosedToday ? "TIDAK_HADIR" : "BELUM";
    return "TIDAK_HADIR"; // past working day, no record
  };

  // Month recap (1st of current month → today), working days only.
  let presentDays = 0;
  let totalDays = 0;
  for (let d = 1; d <= today.day; d += 1) {
    const ymd: Ymd = { year: today.year, month: today.month, day: d };
    if (!isWorkingDay(ymd)) continue;
    totalDays += 1;
    if (presentMap.has(isoKey(ymd.year, ymd.month, ymd.day))) presentDays += 1;
  }

  // Streak: consecutive present working days, skipping an un-resolved today.
  let streakDays = 0;
  for (let back = 0; back < 120; back += 1) {
    const d = utcDate(today.year, today.month, today.day - back);
    const ymd: Ymd = { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
    if (compareYmd(ymd, periodStart) < 0) break;
    if (!isWorkingDay(ymd)) continue;
    const isPresent = presentMap.has(isoKey(ymd.year, ymd.month, ymd.day));
    if (isPresent) {
      streakDays += 1;
    } else if (back === 0 && !windowClosedToday) {
      continue; // today not yet resolved — don't break the streak
    } else {
      break;
    }
  }

  // Last 7 calendar days (oldest → newest, newest = today).
  const last7: DayMark[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = utcDate(today.year, today.month, today.day - i);
    const ymd: Ymd = { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
    last7.push({ label: DOW_LABELS[d.getUTCDay()], status: resolve(ymd) });
  }

  const todayStatusResolved = resolve(today);
  const todayStatus: "HADIR" | "BELUM" | "TIDAK_HADIR" =
    todayStatusResolved === "HADIR"
      ? "HADIR"
      : todayStatusResolved === "TIDAK_HADIR"
        ? "TIDAK_HADIR"
        : "BELUM";
  const todayCheckInLabel = presentMap.get(isoKey(today.year, today.month, today.day)) ?? null;

  return {
    context: toContext(p),
    period: { startISO: dbDateToISO(p.startDate), endISO: dbDateToISO(p.endDate) },
    window: WINDOW,
    todayStatus,
    todayCheckInLabel,
    todayCheckable: isWorkingDay(today),
    monthSummary: { presentDays, totalDays, streakDays },
    last7,
    tasks: taskRows.map((t) => ({
      id: t.id,
      title: t.title,
      deadlineISO: t.deadline.toISOString(),
      status: "NOT_SUBMITTED" as const,
    })),
  };
}

// ---- check-in (server-side window gating; used by the API route) ------------
export type CheckInResult =
  | { ok: true; dateISO: string; checkInTime: string }
  | { ok: false; status: number; error: string };

export async function performCheckIn(userId: string): Promise<CheckInResult> {
  const p = await fetchProfile(userId);
  if (!p) return { ok: false, status: 403, error: "Kamu belum ditempatkan di kelas magang." };

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

  if (compareYmd(today, periodStart) < 0 || compareYmd(today, periodEnd) > 0) {
    return { ok: false, status: 400, error: "Hari ini di luar periode magang." };
  }
  const dow = weekdayUtc(today.year, today.month, today.day);
  if (dow === 0 || dow === 6) {
    return { ok: false, status: 400, error: "Hari ini bukan hari kerja." };
  }
  const holiday = await prisma.holiday.findFirst({
    where: { startDate: { lte: todayDate }, endDate: { gte: todayDate } },
    select: { description: true },
  });
  if (holiday) {
    return { ok: false, status: 400, error: `Hari ini libur (${holiday.description}).` };
  }
  if (computeWindow(now, WINDOW).state !== "OPEN") {
    return {
      ok: false,
      status: 400,
      error: `Di luar jendela absen (${WINDOW.start}–${WINDOW.end} WIB).`,
    };
  }

  try {
    await prisma.attendance.create({
      data: { userId, date: todayDate, status: "PRESENT", checkedInAt: now },
    });
  } catch (err) {
    // Unique (userId, date) — already checked in. Duck-type the code (see the
    // CLAUDE.md gotcha on instanceof across bundle copies).
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return { ok: false, status: 409, error: "Kamu sudah absen hari ini." };
    }
    throw err;
  }

  return {
    ok: true,
    dateISO: isoKey(today.year, today.month, today.day),
    checkInTime: formatInTimeZone(now, WIB_TZ, "HH:mm"),
  };
}
