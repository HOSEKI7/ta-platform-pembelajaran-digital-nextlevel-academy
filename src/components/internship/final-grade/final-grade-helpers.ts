/**
 * Display helpers for the Nilai Akhir surface. Pure functions, safe for both
 * server & client. Lives alongside the components (UI-coupled), but holds no
 * client-only APIs.
 */
import { formatInTimeZone } from "date-fns-tz";

import type { GradeBand, GradeBandTone } from "@/lib/internship-final-grade-types";

const WIB_TZ = "Asia/Jakarta";

/**
 * Score → { letter, predicate, tone } mapping. Encoded as an *ordered* table of
 * lower bounds so there's a single source of truth for the band thresholds and
 * no risk of off-by-one. Each row applies when `score >= min`; the first match
 * wins, with the final row (`min: 0`) catching everything 0–49.
 *
 * Boundaries match PRD-derived spec:
 *   90–100 A · 85–89 A- · 80–84 B+ · 75–79 B · 70–74 B-
 *   65–69 C+ · 60–64 C · 50–59 D · 0–49 E
 */
const BANDS: ReadonlyArray<{ min: number } & GradeBand> = [
  { min: 90, letter: "A", predicate: "Sangat Baik", tone: "emerald" },
  { min: 85, letter: "A-", predicate: "Sangat Baik", tone: "emerald" },
  { min: 80, letter: "B+", predicate: "Baik", tone: "sky" },
  { min: 75, letter: "B", predicate: "Baik", tone: "sky" },
  { min: 70, letter: "B-", predicate: "Baik", tone: "sky" },
  { min: 65, letter: "C+", predicate: "Cukup", tone: "amber" },
  { min: 60, letter: "C", predicate: "Cukup", tone: "amber" },
  { min: 50, letter: "D", predicate: "Perlu Bimbingan", tone: "orange" },
  { min: 0, letter: "E", predicate: "Gagal", tone: "rose" },
];

export function resolveGradeBand(score: number): GradeBand {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const band of BANDS) {
    if (clamped >= band.min) {
      return { letter: band.letter, predicate: band.predicate, tone: band.tone };
    }
  }
  // Unreachable — final entry has min: 0 — kept for type-narrowing.
  return { letter: "E", predicate: "Gagal", tone: "rose" };
}

/** WIB "DD/MM/YYYY" — matches the rest of the app's date convention. */
export function formatGradeDate(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy");
}

/** WIB "DD/MM/YYYY · HH:mm" for the "diperbarui pada" caption. */
export function formatGradeDateTime(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy '·' HH:mm");
}

export function formatPercentage(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

const MONTHS_SHORT_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

/**
 * "14 Apr – 04 Jul 2026" (or "20 Des 2025 – 04 Jan 2026" when the range
 * straddles a year boundary). Parses date-only "yyyy-MM-dd" strings — no TZ
 * math needed since the string already encodes a WIB calendar date.
 */
export function formatPeriodLabel(startISO: string, endISO: string): string {
  const [sy, sm, sd] = startISO.split("-").map((n) => parseInt(n, 10));
  const [ey, em, ed] = endISO.split("-").map((n) => parseInt(n, 10));
  const left =
    sy === ey
      ? `${String(sd).padStart(2, "0")} ${MONTHS_SHORT_ID[sm - 1]}`
      : `${String(sd).padStart(2, "0")} ${MONTHS_SHORT_ID[sm - 1]} ${sy}`;
  const right = `${String(ed).padStart(2, "0")} ${MONTHS_SHORT_ID[em - 1]} ${ey}`;
  return `${left} – ${right}`;
}

// ---- Tone → Tailwind class fragments ---------------------------------------

/**
 * Tone resolves to band-specific surface/text/ring classes for the hero card.
 * Centralised here so the colour language stays consistent across hero + chips.
 */
export const TONE_SURFACE: Record<GradeBandTone, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
  sky: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  orange:
    "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-500/30",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
};

export const TONE_ACCENT_TEXT: Record<GradeBandTone, string> = {
  emerald: "text-emerald-600 dark:text-emerald-300",
  sky: "text-sky-600 dark:text-sky-300",
  amber: "text-amber-600 dark:text-amber-300",
  orange: "text-orange-600 dark:text-orange-300",
  rose: "text-rose-600 dark:text-rose-300",
};

export const TONE_PROGRESS_FILL: Record<GradeBandTone, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
};
