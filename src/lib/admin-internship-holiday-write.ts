import "server-only";

import type { Prisma } from "@/generated/prisma";
import { getWibYmd } from "@/components/internship/attendance/attendance-data";
import { prisma } from "@/lib/prisma";
import { classifyHolidayState } from "@/lib/admin-internship-holiday-query";
import type {
  HolidayCreateInput,
  HolidayUpdateInput,
} from "@/lib/validations/admin-internship-holiday";

/**
 * Server-side write operations for the admin "Konfigurasi Jam Kerja dan Libur"
 * surface — the Tanggal Libur (Holiday) tab (PRD §6.9 / §5.3). Centralises
 * create / update / delete + AuditLog so the route handlers stay thin.
 *
 * Server-authoritative invariants (the UI mirrors these but is never trusted):
 * - The lifecycle state (UPCOMING / ACTIVE / PAST) is recomputed here from the
 *   stored row + today (WIB), not from the client.
 * - UPCOMING → full edit + delete · ACTIVE → only end-early (shorten endDate to
 *   [today, originalEnd]) + description · PAST → read-only.
 * - Holidays cannot start in the past (create / UPCOMING edit) and end-early is
 *   never retroactive (new end ≥ today) — keeps already-elapsed days from
 *   flipping into working days.
 * - The three redundant columns (startDate / days / endDate) are always written
 *   together so every downstream reader (range or `days` expansion) stays
 *   consistent.
 * - Every mutation writes its row + an AuditLog entry inside one transaction.
 */

export type AdminActionContext = { actorId: string };

export type HolidayWriteFailure =
  | "not_found"
  | "bad_date"
  | "locked_active"
  | "locked_past"
  | "invalid_end"
  | "error";

export type HolidayWriteResult =
  | { ok: true; id: string }
  | { ok: false; reason: HolidayWriteFailure };

// ---- Date helpers (date-only ISO "YYYY-MM-DD" ↔ UTC-midnight) ---------------

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "YYYY-MM-DD" → UTC midnight (matches the `@db.Date` storage convention). */
function toUtcMidnight(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isoFromUtc(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Add `n` whole days to a date-only ISO string. */
function addDaysIso(iso: string, n: number): string {
  const d = toUtcMidnight(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoFromUtc(d);
}

/** Inclusive day count between two date-only ISO strings (start ≤ end). */
function daysBetweenInclusive(startISO: string, endISO: string): number {
  const a = toUtcMidnight(startISO).getTime();
  const b = toUtcMidnight(endISO).getTime();
  return Math.round((b - a) / 86_400_000) + 1;
}

/** Today as a WIB calendar date "YYYY-MM-DD" — server-authoritative. */
function todayWibISO(): string {
  const t = getWibYmd(new Date().toISOString());
  return `${t.year}-${pad(t.month + 1)}-${pad(t.day)}`;
}

type HolidaySnapshot = {
  description: string;
  startDate: string;
  endDate: string;
  days: number;
};

function audit(
  ctx: AdminActionContext,
  action: string,
  entityId: string,
  metadata: Prisma.InputJsonValue,
) {
  return {
    actorId: ctx.actorId,
    action,
    entityType: "Holiday",
    entityId,
    metadata,
  };
}

// ===== Create ================================================================

export async function createHoliday(
  input: HolidayCreateInput,
  ctx: AdminActionContext,
): Promise<HolidayWriteResult> {
  const today = todayWibISO();
  const startISO = input.startDate;
  // No retroactive holidays — a sudden holiday today starts today (ACTIVE).
  if (startISO < today) return { ok: false, reason: "bad_date" };

  const endISO = addDaysIso(startISO, input.days - 1);
  const after: HolidaySnapshot = {
    description: input.description.trim(),
    startDate: startISO,
    endDate: endISO,
    days: input.days,
  };

  try {
    const created = await prisma.$transaction(async (tx) => {
      const holiday = await tx.holiday.create({
        data: {
          description: after.description,
          startDate: toUtcMidnight(startISO),
          endDate: toUtcMidnight(endISO),
          days: input.days,
        },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: audit(ctx, "HOLIDAY_CREATE", holiday.id, { after }),
      });
      return holiday;
    });
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("[createHoliday] failed", err);
    return { ok: false, reason: "error" };
  }
}

// ===== Update (edit | endEarly) =============================================

export async function updateHoliday(
  id: string,
  input: HolidayUpdateInput,
  ctx: AdminActionContext,
): Promise<HolidayWriteResult> {
  const existing = await prisma.holiday.findUnique({
    where: { id },
    select: {
      id: true,
      description: true,
      startDate: true,
      endDate: true,
      days: true,
    },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const today = todayWibISO();
  const before: HolidaySnapshot = {
    description: existing.description,
    startDate: isoFromUtc(existing.startDate),
    endDate: isoFromUtc(existing.endDate),
    days: existing.days,
  };
  const state = classifyHolidayState(before.startDate, before.endDate, today);

  let after: HolidaySnapshot;
  let action: string;

  if (input.mode === "edit") {
    // Full edit allowed only while the holiday is still UPCOMING.
    if (state === "ACTIVE") return { ok: false, reason: "locked_active" };
    if (state === "PAST") return { ok: false, reason: "locked_past" };
    // No retroactive holidays.
    if (input.startDate < today) return { ok: false, reason: "bad_date" };
    after = {
      description: input.description.trim(),
      startDate: input.startDate,
      endDate: addDaysIso(input.startDate, input.days - 1),
      days: input.days,
    };
    action = "HOLIDAY_UPDATE";
  } else {
    // End-early allowed only while ACTIVE; the new end must land in
    // [today, originalEnd] — never retroactive, never extending.
    if (state === "UPCOMING") return { ok: false, reason: "locked_active" };
    if (state === "PAST") return { ok: false, reason: "locked_past" };
    const newEnd = input.newEndDate;
    if (newEnd < today || newEnd > before.endDate) {
      return { ok: false, reason: "invalid_end" };
    }
    after = {
      description: input.description.trim(),
      startDate: before.startDate,
      endDate: newEnd,
      days: daysBetweenInclusive(before.startDate, newEnd),
    };
    action = "HOLIDAY_END_EARLY";
  }

  const reason = input.reason?.trim() || null;

  try {
    await prisma.$transaction([
      prisma.holiday.update({
        where: { id },
        data: {
          description: after.description,
          startDate: toUtcMidnight(after.startDate),
          endDate: toUtcMidnight(after.endDate),
          days: after.days,
        },
      }),
      prisma.auditLog.create({
        data: audit(ctx, action, id, { before, after, reason }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[updateHoliday] failed", err);
    return { ok: false, reason: "error" };
  }
}

// ===== Delete ================================================================

export async function deleteHoliday(
  id: string,
  ctx: AdminActionContext,
): Promise<HolidayWriteResult> {
  const existing = await prisma.holiday.findUnique({
    where: { id },
    select: {
      id: true,
      description: true,
      startDate: true,
      endDate: true,
      days: true,
    },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const today = todayWibISO();
  const before: HolidaySnapshot = {
    description: existing.description,
    startDate: isoFromUtc(existing.startDate),
    endDate: isoFromUtc(existing.endDate),
    days: existing.days,
  };
  const state = classifyHolidayState(before.startDate, before.endDate, today);
  // Delete allowed only while UPCOMING (active/past holidays are locked).
  if (state === "ACTIVE") return { ok: false, reason: "locked_active" };
  if (state === "PAST") return { ok: false, reason: "locked_past" };

  try {
    await prisma.$transaction([
      prisma.holiday.delete({ where: { id } }),
      prisma.auditLog.create({
        data: audit(ctx, "HOLIDAY_DELETE", id, { before }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[deleteHoliday] failed", err);
    return { ok: false, reason: "error" };
  }
}

// ===== Failure → HTTP mapping ===============================================

export function describeHolidayFailure(r: {
  reason: HolidayWriteFailure;
}): { status: number; error: string } {
  switch (r.reason) {
    case "not_found":
      return { status: 404, error: "Data libur tidak ditemukan." };
    case "bad_date":
      return {
        status: 400,
        error: "Tanggal mulai tidak boleh sebelum hari ini.",
      };
    case "locked_active":
      return {
        status: 409,
        error:
          "Libur sedang berlangsung — hanya bisa diakhiri lebih awal, tidak bisa diedit penuh atau dihapus.",
      };
    case "locked_past":
      return {
        status: 409,
        error: "Libur sudah lewat dan bersifat read-only.",
      };
    case "invalid_end":
      return {
        status: 400,
        error:
          "Tanggal selesai baru harus antara hari ini dan tanggal selesai semula (tidak boleh mundur ke masa lalu atau memperpanjang).",
      };
    default:
      return { status: 500, error: "Gagal memproses data libur. Coba lagi." };
  }
}
