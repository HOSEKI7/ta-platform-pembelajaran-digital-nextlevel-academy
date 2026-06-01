/**
 * Pure date-only helpers ("YYYY-MM-DD") shared by the holiday dialogs/table.
 * Client-safe — no TZ math, the strings already encode WIB calendar dates.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "YYYY-MM-DD" → "DD/MM/YYYY" for display (PRD date format). */
export function formatDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Add `n` whole days to a date-only ISO string. */
export function addDaysIso(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Inclusive day count between two date-only ISO strings (start ≤ end). */
export function daysBetweenInclusive(startISO: string, endISO: string): number {
  const [ys, ms, ds] = startISO.split("-").map(Number);
  const [ye, me, de] = endISO.split("-").map(Number);
  const a = Date.UTC(ys, ms - 1, ds);
  const b = Date.UTC(ye, me - 1, de);
  return Math.round((b - a) / 86_400_000) + 1;
}
