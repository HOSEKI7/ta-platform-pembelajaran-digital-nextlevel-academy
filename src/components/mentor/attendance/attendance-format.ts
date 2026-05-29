/**
 * Pure, hydration-safe date helpers for the mentor attendance UI. Dates are
 * date-only "yyyy-MM-dd" WIB calendar strings; all math is done on the string
 * (lexicographic compare) or via UTC-noon to avoid timezone drift.
 */
import {
  getWibYmd,
  MONTH_NAMES_ID,
  parseYmd,
} from "@/components/internship/attendance/attendance-data";

const WEEKDAY_FULL_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Today's WIB calendar date as a zero-padded "yyyy-MM-dd". */
export function wibTodayISO(nowISO: string): string {
  const t = getWibYmd(nowISO);
  return toISO(t.year, t.month, t.day);
}

/** "Senin, 29 Mei 2026" */
export function formatLongID(dateISO: string): string {
  const { year, month, day } = parseYmd(dateISO);
  const dow = new Date(Date.UTC(year, month, day, 12)).getUTCDay();
  return `${WEEKDAY_FULL_ID[dow]}, ${day} ${MONTH_NAMES_ID[month]} ${year}`;
}

/** "29/05/2026" (DD/MM/YYYY) */
export function formatShortID(dateISO: string): string {
  const { year, month, day } = parseYmd(dateISO);
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

/** Shift a "yyyy-MM-dd" by `delta` days (UTC-noon stepping, drift-free). */
export function addDaysISO(dateISO: string, delta: number): string {
  const { year, month, day } = parseYmd(dateISO);
  const d = new Date(Date.UTC(year, month, day, 12) + delta * 86_400_000);
  return toISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Date-only ↔ local Date for the shadcn calendar (symmetric, drift-free). */
export function isoToLocalDate(dateISO: string): Date {
  const { year, month, day } = parseYmd(dateISO);
  return new Date(year, month, day);
}
export function localDateToISO(date: Date): string {
  return toISO(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The earlier of two ISO dates is whichever is lexicographically smaller. */
export function minISO(a: string, b: string): string {
  return a <= b ? a : b;
}
