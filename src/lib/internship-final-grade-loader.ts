import "server-only";

import { prisma } from "@/lib/prisma";
import { expandHolidays, getWibYmd } from "@/components/internship/attendance/attendance-data";
import type { InternshipPeriod, MagangContext } from "@/lib/internship-types";
import type {
  AttendanceSummary,
  MagangFinalGrade,
  PerformanceSummary,
  TaskSummary,
} from "@/lib/internship-final-grade-types";

/**
 * Read-side loader for the Peserta-Magang Nilai Akhir surface. One server
 * helper per page, four parallel Prisma reads under the hood (`Promise.all`):
 *   1. InternshipProfile chain (class → field → batch + mentor name)
 *   2. FinalGrade (one-per-student, may be null) with mentor + last-editor
 *   3. Attendance + Holiday counts within the elapsed period
 *   4. Task / TaskSubmission counts for the student's class
 *
 * Returns `null` only when the user has no InternshipProfile (admin hasn't
 * placed them yet) — the caller renders `InternshipEmptyState`.
 */

// ---- date-only helpers (DB @db.Date stored as UTC midnight) -----------------
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}
function dbDateToISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function weekdayUtc(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day, 12)).getUTCDay();
}

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
    fieldLabel: p.fieldName.split(" - ").slice(1).join(" - ") || p.fieldName,
    section: parts[parts.length - 1] ?? p.className,
    classFullName: p.className,
    mentorName: p.mentorName ?? "Belum ditentukan",
    institution: p.institution,
  };
}

/**
 * Working days elapsed in [periodStart, min(today, periodEnd)] excluding
 * weekends + admin holidays. Same precedence as the dashboard month recap.
 */
function countElapsedWorkdays(
  periodStart: Date,
  periodEnd: Date,
  today: Date,
  holidaySet: Set<string>,
): number {
  // Clamp upper bound to periodEnd (so we don't count beyond the magang).
  const upper = today.getTime() < periodEnd.getTime() ? today : periodEnd;
  if (periodStart.getTime() > upper.getTime()) return 0;

  let count = 0;
  // Step day-by-day via UTC midnight (date-only). 86_400_000 ms / day.
  const startMs = Date.UTC(
    periodStart.getUTCFullYear(),
    periodStart.getUTCMonth(),
    periodStart.getUTCDate(),
  );
  const endMs = Date.UTC(upper.getUTCFullYear(), upper.getUTCMonth(), upper.getUTCDate());
  for (let ms = startMs; ms <= endMs; ms += 86_400_000) {
    const d = new Date(ms);
    const dow = weekdayUtc(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    if (dow === 0 || dow === 6) continue;
    const iso = dbDateToISO(d);
    if (holidaySet.has(iso)) continue;
    count += 1;
  }
  return count;
}

function pct(numer: number, denom: number): number {
  if (denom <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((numer / denom) * 100)));
}

export async function loadFinalGrade(userId: string): Promise<MagangFinalGrade | null> {
  const profile = await fetchProfile(userId);
  if (!profile) return null;

  // Period bounds are stored as @db.Date (UTC-midnight). "Today" must be the
  // WIB calendar day, normalised to UTC-midnight so the comparison is purely
  // date-based — matches the dashboard loader.
  const now = new Date();
  const wibToday = getWibYmd(now.toISOString());
  const todayDate = utcDate(wibToday.year, wibToday.month, wibToday.day);

  const elapsedUpper =
    todayDate.getTime() < profile.endDate.getTime() ? todayDate : profile.endDate;

  const [finalGradeRow, presentCount, holidayRows, taskTotal, submittedCount] =
    await Promise.all([
      prisma.finalGrade.findUnique({
        where: { studentId: userId },
        select: {
          grade: true,
          gradedAt: true,
          updatedAt: true,
          mentorId: true,
          lastEditedById: true,
          mentor: { select: { name: true } },
          lastEditedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.attendance.count({
        where: {
          userId,
          status: "PRESENT",
          date: { gte: profile.startDate, lte: elapsedUpper },
        },
      }),
      prisma.holiday.findMany({
        where: { startDate: { lte: elapsedUpper }, endDate: { gte: profile.startDate } },
        select: { startDate: true, days: true, description: true },
      }),
      prisma.task.count({ where: { classId: profile.classId } }),
      prisma.taskSubmission.count({
        where: {
          studentId: userId,
          status: "SUBMITTED",
          task: { classId: profile.classId },
        },
      }),
    ]);

  const holidaySet = new Set(
    expandHolidays(
      holidayRows.map((h) => ({
        startISO: dbDateToISO(h.startDate),
        days: h.days,
        description: h.description,
      })),
    ).keys(),
  );

  const expected = countElapsedWorkdays(
    profile.startDate,
    profile.endDate,
    todayDate,
    holidaySet,
  );

  const attendance: AttendanceSummary = {
    expected,
    // Cap present at expected so the % never exceeds 100 (defensive — possible
    // if a holiday was added retroactively after a PRESENT row was written).
    present: Math.min(presentCount, expected),
    percentage: pct(Math.min(presentCount, expected), expected),
  };

  const tasks: TaskSummary = {
    total: taskTotal,
    submitted: Math.min(submittedCount, taskTotal),
    percentage: pct(Math.min(submittedCount, taskTotal), taskTotal),
  };

  const performance: PerformanceSummary = { attendance, tasks };

  // Editor caption only when the last editor differs from the mentor.
  let editorName: string | null = null;
  if (finalGradeRow?.lastEditedBy && finalGradeRow.lastEditedById !== finalGradeRow.mentorId) {
    editorName = finalGradeRow.lastEditedBy.name;
  }

  const context = toContext(profile);
  const period: InternshipPeriod = {
    startISO: dbDateToISO(profile.startDate),
    endISO: dbDateToISO(profile.endDate),
  };

  return {
    grade: finalGradeRow?.grade ?? null,
    gradedAtISO: finalGradeRow?.gradedAt?.toISOString() ?? null,
    lastUpdatedISO: finalGradeRow?.updatedAt?.toISOString() ?? null,
    mentorName: finalGradeRow?.mentor.name ?? context.mentorName,
    editorName,
    context,
    period,
    performance,
  };
}
