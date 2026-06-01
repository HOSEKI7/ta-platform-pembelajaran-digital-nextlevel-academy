import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import {
  computeWindow,
  getWibYmd,
  parseYmd,
  WIB_TZ,
} from "@/components/internship/attendance/attendance-data";
import {
  PAGE_SIZE,
  type AdminAttendanceParams,
  type AdminAttendanceResult,
  type AdminAttendanceRow,
  type AdminAttendanceStatus,
  type AttendanceDayKind,
  type AttendanceFilterOptions,
} from "@/lib/admin-internship-attendance-query";

const WINDOW = INTERNSHIP_CHECKIN_WINDOW;

// ---- date-only helpers (DB @db.Date stored as UTC midnight) -----------------
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}
function dbDateToISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
/** Day-of-week via UTC-noon to avoid timezone edge shifts. 0 = Sunday. */
function weekdayUtc(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day, 12)).getUTCDay();
}

type Ymd = { year: number; month: number; day: number };
function ymdFromDbDate(d: Date): Ymd {
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}
function compareYmd(a: Ymd, b: Ymd): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

/** "Batch - Field - Class" label from a nested class include. */
type ClassWithChain = {
  name: string;
  field: { name: string; batch: { name: string; startDate: Date; endDate: Date } };
};
/**
 * Clean "Batch - Bidang - Kelas" label, e.g. "Batch 1 2026 - Web Programming - A".
 * The Field/Class names redundantly embed the batch prefix (e.g. Field
 * "Batch 1 - Web Programming", Class "Batch 1 - Web Programming - A"), so strip
 * it to the meaningful tail — mirrors the mentor `toContext` cleanup.
 */
function classLabel(cls: ClassWithChain): string {
  const field =
    cls.field.name.split(" - ").slice(1).join(" - ") || cls.field.name;
  const section = cls.name.split(" - ").pop() ?? cls.name;
  return `${cls.field.batch.name} - ${field} - ${section}`;
}

const classChainSelect = {
  name: true,
  field: {
    select: {
      name: true,
      batch: { select: { name: true, startDate: true, endDate: true } },
    },
  },
} satisfies Prisma.ClassSelect;

/**
 * Dropdown options for the cascading Batch → Field → Class filter, plus the
 * earliest navigable date (earliest batch start). The lists are small and static
 * enough to ship whole and cascade client-side; the server still filters by id.
 */
export async function loadAttendanceFilterOptions(): Promise<AttendanceFilterOptions> {
  const [batches, fields, classes] = await Promise.all([
    prisma.batch.findMany({
      select: { id: true, name: true, startDate: true },
      orderBy: { name: "asc" },
    }),
    prisma.field.findMany({
      select: { id: true, name: true, batchId: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, fieldId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Earliest batch start → lower navigable bound (fallback: today WIB).
  const t = getWibYmd(new Date().toISOString());
  const todayISO = `${t.year}-${String(t.month + 1).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
  const minDateISO = batches.reduce<string>((min, b) => {
    const iso = dbDateToISO(b.startDate);
    return iso < min ? iso : min;
  }, todayISO);

  return {
    batches: batches.map((b) => ({ id: b.id, name: b.name })),
    fields: fields.map((f) => ({ id: f.id, name: f.name, batchId: f.batchId })),
    classes: classes.map((c) => ({ id: c.id, name: c.name, fieldId: c.fieldId })),
    minDateISO,
  };
}

/** Class-scoped `where` from the (optional) batch/field/class filter ids. */
function classFilter(
  params: Pick<AdminAttendanceParams, "batchId" | "fieldId" | "classId">,
): Prisma.ClassWhereInput {
  return {
    ...(params.classId ? { id: params.classId } : {}),
    ...(params.fieldId ? { fieldId: params.fieldId } : {}),
    ...(params.batchId ? { field: { batchId: params.batchId } } : {}),
  };
}

type RosterRow = {
  user: { id: string; name: string; image: string | null };
  class: ClassWithChain;
};

/**
 * One page of the roster (mentor or intern) with each row's attendance status
 * for the selected date, derived at read time.
 *
 * Performance shape:
 * - 2 parallel queries for the page slice (count + findMany), then a single
 *   `attendance.findMany` keyed by the page's userIds (anti-N+1).
 * - Status derivation mirrors the mentor loader: only PRESENT/ABSENT rows are
 *   stored; absence on a settled working day is computed. Admin overrides write
 *   explicit ABSENT rows, which this loader honours.
 */
export async function loadAdminAttendanceByDate(
  params: AdminAttendanceParams,
): Promise<AdminAttendanceResult> {
  const { scope, dateISO, search, page } = params;

  const sel = parseYmd(dateISO);
  const selDate = utcDate(sel.year, sel.month, sel.day);
  const now = new Date();
  const today = getWibYmd(now.toISOString());
  const isToday = compareYmd(sel, today) === 0;
  const isPastOrToday = compareYmd(sel, today) <= 0;
  const windowClosedToday = computeWindow(now, WINDOW).state === "AFTER";

  const userWhere: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };
  const cls = classFilter(params);

  // Roster source differs by scope; everything else is identical.
  const profileWhere = { class: cls, user: userWhere };
  const profileSelect = {
    user: { select: { id: true, name: true, image: true } },
    class: { select: classChainSelect },
  };
  const orderBy = { user: { name: "asc" as const } };
  const skip = (page - 1) * PAGE_SIZE;

  let total: number;
  let rosterRows: RosterRow[];
  if (scope === "mentor") {
    const [count, roster] = await Promise.all([
      prisma.mentorProfile.count({ where: profileWhere }),
      prisma.mentorProfile.findMany({
        where: profileWhere,
        select: profileSelect,
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
    ]);
    total = count;
    rosterRows = roster;
  } else {
    const [count, roster] = await Promise.all([
      prisma.internshipProfile.count({ where: profileWhere }),
      prisma.internshipProfile.findMany({
        where: profileWhere,
        select: profileSelect,
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
    ]);
    total = count;
    rosterRows = roster;
  }

  const userIds = rosterRows.map((r) => r.user.id);

  // One attendance read for the whole page (anti-N+1).
  const attendance = userIds.length
    ? await prisma.attendance.findMany({
        where: { userId: { in: userIds }, date: selDate },
        select: { userId: true, status: true, checkedInAt: true },
      })
    : [];
  const byUser = new Map(attendance.map((a) => [a.userId, a]));

  // Holiday is global; weekend + period drive the rest. The banner uses the
  // (optional) batch filter's period to decide LUAR_PERIODE.
  const holiday = await prisma.holiday.findFirst({
    where: { startDate: { lte: selDate }, endDate: { gte: selDate } },
    select: { description: true },
  });
  const isWeekend = weekdayUtc(sel.year, sel.month, sel.day);
  const weekend = isWeekend === 0 || isWeekend === 6;

  const rows: AdminAttendanceRow[] = rosterRows.map((r) => {
    const rec = byUser.get(r.user.id) ?? null;
    const checkInTime =
      rec?.status === "PRESENT" && rec.checkedInAt
        ? formatInTimeZone(rec.checkedInAt, WIB_TZ, "HH:mm")
        : null;

    // Per-row day classification (period is per the row's own batch).
    const start = ymdFromDbDate(r.class.field.batch.startDate);
    const end = ymdFromDbDate(r.class.field.batch.endDate);
    const inPeriod = compareYmd(sel, start) >= 0 && compareYmd(sel, end) <= 0;
    const working = inPeriod && !weekend && !holiday;

    let status: AdminAttendanceStatus;
    if (!working) {
      // No attendance expected — only surface an explicit recorded row.
      status =
        rec?.status === "PRESENT"
          ? "HADIR"
          : rec?.status === "ABSENT"
            ? "TIDAK_HADIR"
            : "BELUM";
    } else if (rec?.status === "PRESENT") {
      status = "HADIR";
    } else if (rec?.status === "ABSENT") {
      status = "TIDAK_HADIR";
    } else if (isToday && !windowClosedToday) {
      status = "BELUM";
    } else {
      status = "TIDAK_HADIR";
    }

    return {
      userId: r.user.id,
      name: r.user.name,
      image: r.user.image,
      classLabel: classLabel(r.class),
      status,
      checkInTime: status === "HADIR" ? checkInTime : null,
      editable: working && isPastOrToday,
    };
  });

  // Banner kind: prefer the selected batch's period when one is filtered.
  let kind: AttendanceDayKind;
  if (weekend || holiday) {
    kind = "LIBUR";
  } else if (params.batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: params.batchId },
      select: { startDate: true, endDate: true },
    });
    const inPeriod =
      batch &&
      compareYmd(sel, ymdFromDbDate(batch.startDate)) >= 0 &&
      compareYmd(sel, ymdFromDbDate(batch.endDate)) <= 0;
    kind = inPeriod ? "WORKING" : "LUAR_PERIODE";
  } else {
    kind = "WORKING";
  }

  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    day: { dateISO, kind, holidayLabel: holiday?.description ?? null },
    serverNowISO: now.toISOString(),
  };
}
