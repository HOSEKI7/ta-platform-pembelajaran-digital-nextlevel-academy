import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import { resolveTaskFileUrl } from "@/lib/bunny-storage";
import { signTaskDescriptionImages } from "@/lib/task-description";
import { formatFileSize } from "@/components/internship/tasks/task-helpers";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  buildMonthFromData,
  computeWindow,
  expandHolidays,
  getWibYmd,
  parseYmd,
  WIB_TZ,
} from "@/components/internship/attendance/attendance-data";
import type { CheckInResult } from "@/lib/internship-data-loader";
import type {
  AttendanceDisplayStatus,
  AttendanceMonthDTO,
  TodayOff,
} from "@/lib/internship-types";
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
  MentorGradesData,
  MentorStudentsData,
  MentorSelfAttendance,
  MentorSubmissionRow,
  MentorSubmissionStatus,
  MentorTaskDetail,
  MentorTaskEditData,
  MentorTaskRow,
  MentorTasksData,
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
  gender: "MALE" | "FEMALE" | null;
};

/** Polite Indonesian honorific from gender; null keeps the greeting plain. */
export function honorificForGender(gender: "MALE" | "FEMALE" | null): string | null {
  if (gender === "MALE") return "Pak";
  if (gender === "FEMALE") return "Bu";
  return null;
}

async function fetchMentorProfile(
  userId: string,
): Promise<MentorProfileRow | null> {
  const p = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: {
      classId: true,
      gender: true,
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
    gender: p.gender,
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

// ---- absensi mentor (the mentor's OWN attendance — calendar grid + check-in) -
/**
 * The mentor's own attendance for a month, as a calendar grid. Mirrors the
 * Peserta-Magang `loadAttendanceMonth`: only PRESENT rows exist (absence is
 * derived), the period comes from the mentor's batch, and holidays are global.
 * Returns `null` when the mentor isn't assigned a class.
 */
export async function loadMentorAttendanceMonth(
  userId: string,
  year: number,
  month: number,
): Promise<AttendanceMonthDTO | null> {
  const p = await fetchMentorProfile(userId);
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

/**
 * Record the mentor's own check-in for today. All gating is server-side
 * (period, working day, holiday, WIB window, idempotency) — the client's clock
 * is never trusted. Reuses the shared `Attendance` table (mentor's userId);
 * since mentors have no `internshipProfile`, these rows never appear in any
 * student roster. Mirrors `performCheckIn` from the Peserta-Magang loader.
 */
export async function performMentorCheckIn(userId: string): Promise<CheckInResult> {
  const p = await fetchMentorProfile(userId);
  if (!p) {
    return { ok: false, status: 403, error: "Kamu belum ditugaskan ke kelas mana pun." };
  }

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

// ---- nilai akhir (class-scoped final grades, one row per mentee) ------------
/**
 * Every mentee in the mentor's class with their final grade (null = not graded
 * yet). Single query (no N+1): the roster left-joins `FinalGrade` through the
 * user relation, so ungraded students still appear. Returns `null` when the
 * mentor isn't assigned a class.
 */
export async function loadMentorGrades(
  userId: string,
): Promise<MentorGradesData | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  const rows = await prisma.internshipProfile.findMany({
    where: { classId: p.classId },
    select: {
      institution: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          finalGradeAsStudent: {
            select: {
              grade: true,
              note: true,
              gradedAt: true,
              isLocked: true,
              overrideReason: true,
            },
          },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return {
    context: toContext(p, rows.length),
    grades: rows.map((r) => ({
      studentId: r.user.id,
      name: r.user.name,
      image: r.user.image,
      institution: r.institution,
      grade: r.user.finalGradeAsStudent?.grade ?? null,
      note: r.user.finalGradeAsStudent?.note ?? null,
      gradedAt: r.user.finalGradeAsStudent?.gradedAt?.toISOString() ?? null,
      isLocked: r.user.finalGradeAsStudent?.isLocked ?? false,
      overrideReason: r.user.finalGradeAsStudent?.overrideReason ?? null,
    })),
  };
}

// ---- kelola tugas (class-scoped task list with submission progress) ---------
/**
 * Every task in the mentor's class (upcoming + past) with its submission
 * progress, for the "Kelola Tugas" list. One task query (submissions included →
 * no N+1) plus a mentee count run in parallel. Returns `null` when the mentor
 * isn't assigned a class.
 */
export async function loadMentorTasks(
  userId: string,
): Promise<MentorTasksData | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  const [totalStudents, taskRows] = await Promise.all([
    prisma.internshipProfile.count({ where: { classId: p.classId } }),
    prisma.task.findMany({
      where: { classId: p.classId },
      select: {
        id: true,
        title: true,
        deadline: true,
        attachmentUrl: true,
        submissions: { select: { status: true } },
      },
      orderBy: { deadline: "asc" },
    }),
  ]);

  const tasks: MentorTaskRow[] = taskRows.map((t) => ({
    id: t.id,
    title: t.title,
    deadlineISO: t.deadline.toISOString(),
    submittedCount: t.submissions.filter((s) => s.status === "SUBMITTED").length,
    totalStudents,
    hasAttachment: Boolean(t.attachmentUrl),
  }));

  return {
    context: toContext(p, totalStudents),
    tasks,
    serverNowISO: new Date().toISOString(),
  };
}

// ---- task detail (one task + full class submission roster) ------------------
type TaskRowForDetail = {
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
};
function resolveAttachment(row: TaskRowForDetail) {
  if (!row.attachmentUrl) return null;
  return {
    name: row.attachmentName ?? "Lampiran",
    sizeLabel: row.attachmentSize ? formatFileSize(row.attachmentSize) : "—",
    url: resolveTaskFileUrl(row.attachmentUrl),
  };
}

/**
 * One task plus every mentee's submission row (class-scoped). Status is derived
 * at read time: SUBMITTED→TERKUMPUL · NOT_SUBMITTED+feedback→DIKEMBALIKAN ·
 * else past-deadline→TERLEWAT / BELUM. `null` when the task isn't in the
 * mentor's class (page renders 404).
 */
export async function loadMentorTaskDetail(
  userId: string,
  taskId: string,
): Promise<MentorTaskDetail | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  const [task, students] = await Promise.all([
    prisma.task.findFirst({
      where: { id: taskId, classId: p.classId },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentSize: true,
        submissions: {
          select: {
            studentId: true,
            status: true,
            submissionUrl: true,
            submissionFileName: true,
            submissionFileSize: true,
            submittedAt: true,
            feedbackText: true,
          },
        },
      },
    }),
    prisma.internshipProfile.findMany({
      where: { classId: p.classId },
      select: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);
  if (!task) return null;

  const now = new Date();
  const overdue = task.deadline.getTime() < now.getTime();
  const byStudent = new Map(task.submissions.map((s) => [s.studentId, s]));

  let terkumpul = 0;
  const rows: MentorSubmissionRow[] = students.map(({ user }) => {
    const sub = byStudent.get(user.id) ?? null;

    let status: MentorSubmissionStatus;
    if (sub?.status === "SUBMITTED") status = "TERKUMPUL";
    else if (sub?.feedbackText) status = "DIKEMBALIKAN";
    else status = overdue ? "TERLEWAT" : "BELUM";
    if (status === "TERKUMPUL") terkumpul += 1;

    const file = sub?.submissionUrl
      ? {
          name: sub.submissionFileName ?? "Berkas",
          sizeLabel: sub.submissionFileSize
            ? formatFileSize(sub.submissionFileSize)
            : "—",
          url: resolveTaskFileUrl(sub.submissionUrl),
        }
      : null;

    return {
      studentId: user.id,
      name: user.name,
      image: user.image,
      status,
      submittedAtISO: sub?.submittedAt ? sub.submittedAt.toISOString() : null,
      file,
      feedbackText: sub?.feedbackText ?? null,
    };
  });

  return {
    context: toContext(p, students.length),
    task: {
      id: task.id,
      title: task.title,
      descriptionHtml: signTaskDescriptionImages(task.description),
      deadlineISO: task.deadline.toISOString(),
      attachment: resolveAttachment(task),
    },
    rows,
    summary: { terkumpul, total: students.length },
    serverNowISO: now.toISOString(),
  };
}

/** Task fields prefilled for the edit form. `null` when not in mentor's class. */
export async function loadMentorTaskForEdit(
  userId: string,
  taskId: string,
): Promise<MentorTaskEditData | null> {
  const p = await fetchMentorProfile(userId);
  if (!p) return null;

  const task = await prisma.task.findFirst({
    where: { id: taskId, classId: p.classId },
    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      attachmentUrl: true,
      attachmentName: true,
      attachmentSize: true,
    },
  });
  if (!task) return null;

  return {
    context: toContext(p, 0),
    period: { startISO: dbDateToISO(p.startDate), endISO: dbDateToISO(p.endDate) },
    task: {
      id: task.id,
      title: task.title,
      descriptionHtml: signTaskDescriptionImages(task.description),
      deadlineWib: formatInTimeZone(task.deadline, WIB_TZ, "yyyy-MM-dd'T'HH:mm"),
      attachment: task.attachmentUrl
        ? {
            name: task.attachmentName ?? "Lampiran",
            sizeLabel: task.attachmentSize
              ? formatFileSize(task.attachmentSize)
              : "—",
          }
        : null,
    },
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

  const [menteeCount, presentToday, holiday, selfToday, taskRows] = await Promise.all([
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
    // The mentor's OWN attendance row for today (drives the dashboard check-in).
    prisma.attendance.findUnique({
      where: { userId_date: { userId, date: todayDate } },
      select: { status: true, checkedInAt: true },
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

  // ---- mentor's OWN attendance today (drives the dashboard check-in CTA) ----
  const selfPresent = selfToday?.status === "PRESENT";
  const selfCheckInLabel =
    selfPresent && selfToday?.checkedInAt
      ? formatInTimeZone(selfToday.checkedInAt, WIB_TZ, "HH:mm")
      : null;
  let selfStatus: AttendanceDisplayStatus;
  if (selfPresent) selfStatus = "HADIR";
  else if (isWorkingDay && win === "AFTER") selfStatus = "TIDAK_HADIR";
  else selfStatus = "BELUM";
  // Why today is non-working (drives the hero's "Libur" state), or null.
  const selfOff: TodayOff | null = !inPeriod
    ? { reason: "LUAR_PERIODE", label: null }
    : isHoliday
      ? { reason: "HOLIDAY", label: holiday?.description ?? null }
      : isWeekend
        ? { reason: "WEEKEND", label: null }
        : null;
  const selfAttendance: MentorSelfAttendance = {
    status: selfStatus,
    checkInLabel: selfCheckInLabel,
    off: selfOff,
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
    honorific: honorificForGender(p.gender),
    menteeCount,
    attendance,
    selfAttendance,
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
