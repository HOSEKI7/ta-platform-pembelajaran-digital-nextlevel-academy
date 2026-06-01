import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getWibYmd,
  parseYmd,
} from "@/components/internship/attendance/attendance-data";
import type { AttendanceScope, SettableStatus } from "@/lib/admin-internship-attendance-query";

type Ymd = { year: number; month: number; day: number };
function utcDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d));
}
function ymdFromDbDate(d: Date): Ymd {
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}
function compareYmd(a: Ymd, b: Ymd): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}
function weekdayUtc(y: number, m: number, d: number): number {
  return new Date(Date.UTC(y, m, d, 12)).getUTCDay();
}

export type AttendanceWriteFailure =
  | "not_found"
  | "out_of_range"
  | "not_working_day"
  | "error";

export type AttendanceWriteResult =
  | { ok: true }
  | { ok: false; reason: AttendanceWriteFailure; detail?: string };

export type SetAttendanceArgs = {
  scope: AttendanceScope;
  userId: string;
  dateISO: string;
  status: SettableStatus;
  actorId: string;
};

/**
 * Admin override of one person's attendance for one date (PRD §6.11 / §6.9.2).
 *
 * Server-authoritative gating (never trusts the client clock):
 * - the subject must hold the matching profile for `scope` (not_found),
 * - the date must be on/before today WIB (out_of_range),
 * - the date must be a working day for the subject's batch — in period, not a
 *   weekend, not a global holiday (not_working_day).
 *
 * Writes an explicit row keyed by the unique `(userId, date)`:
 *   HADIR       → PRESENT, checkedInAt = now (WIB instant), editedById = admin
 *   TIDAK_HADIR → ABSENT,  checkedInAt = null,              editedById = admin
 * The upsert + AuditLog (`ATTENDANCE_EDIT`) run in one transaction.
 */
export async function setAttendanceStatus(
  args: SetAttendanceArgs,
): Promise<AttendanceWriteResult> {
  const { scope, userId, dateISO, status, actorId } = args;

  // Resolve the subject's batch period via their scope profile.
  const profile =
    scope === "mentor"
      ? await prisma.mentorProfile.findUnique({
          where: { userId },
          select: {
            class: { select: { field: { select: { batch: { select: { startDate: true, endDate: true } } } } } },
          },
        })
      : await prisma.internshipProfile.findUnique({
          where: { userId },
          select: {
            class: { select: { field: { select: { batch: { select: { startDate: true, endDate: true } } } } } },
          },
        });
  if (!profile) {
    return { ok: false, reason: "not_found" };
  }
  const batch = profile.class.field.batch;

  const sel = parseYmd(dateISO);
  const now = new Date();
  const today = getWibYmd(now.toISOString());

  // Date must be on/before today (WIB).
  if (compareYmd(sel, today) > 0) {
    return {
      ok: false,
      reason: "out_of_range",
      detail: "Tidak bisa mengubah absensi tanggal yang akan datang.",
    };
  }

  // Working-day gate.
  const start = ymdFromDbDate(batch.startDate);
  const end = ymdFromDbDate(batch.endDate);
  if (compareYmd(sel, start) < 0 || compareYmd(sel, end) > 0) {
    return {
      ok: false,
      reason: "not_working_day",
      detail: "Tanggal di luar periode magang.",
    };
  }
  const dow = weekdayUtc(sel.year, sel.month, sel.day);
  if (dow === 0 || dow === 6) {
    return { ok: false, reason: "not_working_day", detail: "Tanggal jatuh di akhir pekan." };
  }
  const selDate = utcDate(sel.year, sel.month, sel.day);
  const holiday = await prisma.holiday.findFirst({
    where: { startDate: { lte: selDate }, endDate: { gte: selDate } },
    select: { description: true },
  });
  if (holiday) {
    return {
      ok: false,
      reason: "not_working_day",
      detail: `Tanggal libur (${holiday.description}).`,
    };
  }

  const isPresent = status === "HADIR";
  // Mark HADIR with the moment of editing (today before window close → keep it
  // simple and record "now"); ABSENT clears the time.
  const checkedInAt = isPresent ? now : null;
  const attendanceStatus = isPresent ? "PRESENT" : "ABSENT";

  try {
    await prisma.$transaction([
      prisma.attendance.upsert({
        where: { userId_date: { userId, date: selDate } },
        create: {
          userId,
          date: selDate,
          status: attendanceStatus,
          checkedInAt,
          editedById: actorId,
        },
        update: {
          status: attendanceStatus,
          checkedInAt,
          editedById: actorId,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId,
          action: "ATTENDANCE_EDIT",
          entityType: "Attendance",
          entityId: userId,
          metadata: { scope, userId, dateISO, to: status },
        },
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[setAttendanceStatus] failed", err);
    return { ok: false, reason: "error" };
  }
}

/** Map a write failure to an HTTP status + user-facing message. */
export function describeAttendanceFailure(result: {
  reason: AttendanceWriteFailure;
  detail?: string;
}): { status: number; error: string } {
  switch (result.reason) {
    case "not_found":
      return { status: 404, error: "Peserta tidak ditemukan untuk peran ini." };
    case "out_of_range":
      return {
        status: 400,
        error: result.detail ?? "Tanggal di luar rentang yang diizinkan.",
      };
    case "not_working_day":
      return {
        status: 400,
        error: result.detail ?? "Bukan hari kerja — absensi tidak bisa diubah.",
      };
    case "error":
      return { status: 500, error: "Gagal menyimpan absensi. Coba lagi." };
  }
}
