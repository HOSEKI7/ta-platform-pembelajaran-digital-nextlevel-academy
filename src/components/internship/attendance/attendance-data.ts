/**
 * Pure data + helpers for the Peserta-Magang attendance page (UI-only pass — no
 * backend). The calendar mock is generated deterministically from a server-
 * captured `todayISO`, so SSR and the first client render agree. Real data from
 * the `Attendance` table replaces `buildMockMonth` in a later backend pass.
 */
import { formatInTimeZone } from "date-fns-tz";

import type {
  AttendanceWindow,
  Holiday,
} from "@/components/internship/dashboard/mock-data";

export const WIB_TZ = "Asia/Jakarta";

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/** Monday-first weekday labels (Indonesia convention). */
export const WEEKDAY_LABELS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

/**
 * Calendar cell status. Superset of the tri-state in `mock-data.ts`: adds LIBUR
 * (weekend / holiday / non-working), FUTURE (upcoming within the period) and
 * LUAR_PERIODE (outside the internship period — not counted) so a month grid
 * reads fully even on the period's first/last partial months.
 */
export type CalendarDayStatus =
  | "HADIR"
  | "TIDAK_HADIR"
  | "BELUM"
  | "LIBUR"
  | "FUTURE"
  | "LUAR_PERIODE";

export type CalendarDay = {
  /** Day-of-month (1..31), or null for leading/trailing padding cells. */
  day: number | null;
  status: CalendarDayStatus | null;
  /** "yyyy-MM-dd" for real cells. */
  dateISO?: string;
  /** Mock check-in time "HH:mm" for HADIR days. */
  checkInTime?: string;
  /** Holiday description for LIBUR-by-holiday days (tooltip). */
  holidayLabel?: string;
  isToday?: boolean;
};

export type CalendarMonth = {
  year: number;
  /** 0-based month index. */
  month: number;
  /** Flat cell list including padding; length is a multiple of 7. */
  cells: CalendarDay[];
  hadir: number;
  tidakHadir: number;
};

/** Cell background/text per status — light + dark. Colour language matches the
 *  dashboard (Hadir = hijau, Tidak Hadir = merah, Belum = abu-abu). */
export const CALENDAR_STATUS_STYLES: Record<CalendarDayStatus, string> = {
  HADIR:
    "bg-emerald-500 text-white ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/90",
  TIDAK_HADIR:
    "bg-red-500 text-white ring-1 ring-inset ring-red-600/20 dark:bg-red-500/90",
  BELUM: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
  LIBUR: "bg-zinc-50 text-zinc-300 dark:bg-white/[0.02] dark:text-zinc-600",
  FUTURE:
    "bg-transparent text-zinc-300 ring-1 ring-inset ring-zinc-100 dark:text-zinc-600 dark:ring-white/5",
  LUAR_PERIODE:
    "bg-transparent text-zinc-200 ring-1 ring-inset ring-dashed ring-zinc-100 dark:text-zinc-700 dark:ring-white/5",
};

export const STATUS_LEGEND: ReadonlyArray<{
  status: CalendarDayStatus;
  label: string;
  swatch: string;
}> = [
  { status: "HADIR", label: "Hadir", swatch: "bg-emerald-500" },
  { status: "TIDAK_HADIR", label: "Tidak hadir", swatch: "bg-red-500" },
  { status: "BELUM", label: "Belum absen", swatch: "bg-zinc-300 dark:bg-white/25" },
  { status: "LIBUR", label: "Libur", swatch: "bg-zinc-200 dark:bg-white/10" },
  {
    status: "LUAR_PERIODE",
    label: "Di luar periode",
    swatch: "border border-dashed border-zinc-300 bg-transparent dark:border-white/15",
  },
];

export type Ymd = { year: number; month: number; day: number };

/** WIB year/month(0-based)/day for an ISO instant. */
export function getWibYmd(iso: string): Ymd {
  const d = new Date(iso);
  return {
    year: parseInt(formatInTimeZone(d, WIB_TZ, "yyyy"), 10),
    month: parseInt(formatInTimeZone(d, WIB_TZ, "M"), 10) - 1,
    day: parseInt(formatInTimeZone(d, WIB_TZ, "d"), 10),
  };
}

/** Parse a date-only "yyyy-MM-dd" into a y/m/d tuple (month 0-based). No TZ math
 *  — the string already encodes a WIB calendar date. */
export function parseYmd(dateISO: string): Ymd {
  const [y, m, d] = dateISO.split("-").map((n) => parseInt(n, 10));
  return { year: y, month: m - 1, day: d };
}

/** Zero-pad a y/m/d into "yyyy-MM-dd". */
function toDateISO({ year, month, day }: Ymd): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Expand admin holiday spans into a dateISO → description map. Each span covers
 * `days` consecutive days from `startISO` (inclusive). Pure & hydration-safe:
 * stepping via UTC-noon dates avoids DST/timezone drift on the increment.
 */
export function expandHolidays(holidays: Holiday[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const h of holidays) {
    const start = parseYmd(h.startISO);
    const base = Date.UTC(start.year, start.month, start.day, 12);
    for (let i = 0; i < Math.max(1, h.days); i += 1) {
      const d = new Date(base + i * 86_400_000);
      const iso = toDateISO({
        year: d.getUTCFullYear(),
        month: d.getUTCMonth(),
        day: d.getUTCDate(),
      });
      if (!map.has(iso)) map.set(iso, h.description);
    }
  }
  return map;
}

/** First/last navigable {year, month} from a date-only period (0-based month). */
export function periodMonthBounds(period: { startISO: string; endISO: string }): {
  first: { year: number; month: number };
  last: { year: number; month: number };
} {
  const s = parseYmd(period.startISO);
  const e = parseYmd(period.endISO);
  return {
    first: { year: s.year, month: s.month },
    last: { year: e.year, month: e.month },
  };
}

/** Clamp a {year, month} into [first, last] using a month ordinal. */
export function clampMonth(
  target: { year: number; month: number },
  first: { year: number; month: number },
  last: { year: number; month: number },
): { year: number; month: number } {
  const ord = (m: { year: number; month: number }) => m.year * 12 + m.month;
  const t = ord(target);
  if (t < ord(first)) return first;
  if (t > ord(last)) return last;
  return target;
}

/** -1 / 0 / 1 comparison of two y/m/d tuples. */
function compareYmd(
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number },
): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

/** Day-of-week via a UTC-noon date to avoid timezone edge shifts. 0 = Sun. */
function weekdayUtc(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day, 12)).getUTCDay();
}

export type BuildMonthOptions = {
  /** Period bounds (date-only "yyyy-MM-dd"); days outside → LUAR_PERIODE. */
  periodStartISO?: string;
  periodEndISO?: string;
  /** dateISO → holiday description; matching days → LIBUR with a tooltip. */
  holidayMap?: Map<string, string>;
};

/**
 * Generate a deterministic mock month. Status precedence per day: outside the
 * internship period → LUAR_PERIODE, holiday → LIBUR (+label), weekend → LIBUR,
 * after today → FUTURE, today → BELUM, past weekday → HADIR with a sparse,
 * reproducible set of TIDAK_HADIR (modulo pattern). Pure: same inputs → same
 * output, so it's hydration-safe. Period/holiday options are optional and
 * backward-compatible (omitted → original unbounded behaviour).
 */
export function buildMockMonth(
  year: number,
  month: number,
  todayISO: string,
  opts: BuildMonthOptions = {},
): CalendarMonth {
  const today = getWibYmd(todayISO);
  const periodStart = opts.periodStartISO ? parseYmd(opts.periodStartISO) : null;
  const periodEnd = opts.periodEndISO ? parseYmd(opts.periodEndISO) : null;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (weekdayUtc(year, month, 1) + 6) % 7; // Monday-first padding

  const cells: CalendarDay[] = [];
  for (let i = 0; i < lead; i += 1) cells.push({ day: null, status: null });

  let hadir = 0;
  let tidakHadir = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const ymd = { year, month, day };
    const dow = weekdayUtc(year, month, day);
    const isWeekend = dow === 0 || dow === 6;
    const cmp = compareYmd(ymd, today);
    const isToday = cmp === 0;
    const dateISO = toDateISO(ymd);
    const outOfPeriod =
      (periodStart !== null && compareYmd(ymd, periodStart) < 0) ||
      (periodEnd !== null && compareYmd(ymd, periodEnd) > 0);
    const holidayLabel = opts.holidayMap?.get(dateISO);

    let status: CalendarDayStatus;
    let checkInTime: string | undefined;

    if (outOfPeriod) {
      status = "LUAR_PERIODE";
    } else if (holidayLabel) {
      status = "LIBUR";
    } else if (isWeekend) {
      status = "LIBUR";
    } else if (cmp > 0) {
      status = "FUTURE";
    } else if (isToday) {
      status = "BELUM";
    } else {
      const absent = day % 8 === 5 || day % 13 === 0;
      if (absent) {
        status = "TIDAK_HADIR";
        tidakHadir += 1;
      } else {
        status = "HADIR";
        hadir += 1;
        checkInTime = `09:${String((day * 13) % 55).padStart(2, "0")}`;
      }
    }

    cells.push({ day, status, dateISO, isToday, checkInTime, holidayLabel });
  }

  while (cells.length % 7 !== 0) cells.push({ day: null, status: null });

  return { year, month, cells, hadir, tidakHadir };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

/** Window state + marker position (0..100) for a given instant in WIB. */
export function computeWindow(
  now: Date,
  window: AttendanceWindow,
): { state: "BEFORE" | "OPEN" | "AFTER"; markerPct: number } {
  const nowMin =
    parseInt(formatInTimeZone(now, WIB_TZ, "H"), 10) * 60 +
    parseInt(formatInTimeZone(now, WIB_TZ, "m"), 10);
  const startMin = toMinutes(window.start);
  const endMin = toMinutes(window.end);
  const state: "BEFORE" | "OPEN" | "AFTER" =
    nowMin < startMin ? "BEFORE" : nowMin > endMin ? "AFTER" : "OPEN";
  const markerPct =
    endMin <= startMin
      ? 0
      : Math.min(100, Math.max(0, ((nowMin - startMin) / (endMin - startMin)) * 100));
  return { state, markerPct };
}
