"use client";

import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AttendanceMonthDTO, CalendarDay } from "@/lib/internship-types";

import {
  CALENDAR_STATUS_STYLES,
  MONTH_NAMES_ID,
  STATUS_LEGEND,
  WEEKDAY_LABELS_ID,
} from "./attendance-data";

type Props = {
  year: number;
  /** 0-based month index. */
  month: number;
  /** Server/query-resolved month grid (undefined while first-loading). */
  data: AttendanceMonthDTO | undefined;
  /** True while fetching a new month — dims the grid. */
  isFetching: boolean;
  /** True when the displayed month is the current (today's) month. */
  isCurrentMonth: boolean;
  canPrev: boolean;
  canNext: boolean;
  /** Whether today falls within the period (controls the "Hari ini" shortcut). */
  canJumpToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function AttendanceCalendar({
  year,
  month,
  data,
  isFetching,
  isCurrentMonth,
  canPrev,
  canNext,
  canJumpToday,
  onPrev,
  onNext,
  onToday,
}: Props) {
  const cells: CalendarDay[] = data?.cells ?? [];
  const hadir = data?.hadir ?? 0;
  const tidakHadir = data?.tidakHadir ?? 0;
  const recorded = hadir + tidakHadir;
  const ratePct = recorded ? Math.round((hadir / recorded) * 100) : 0;

  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 transition-opacity sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        isFetching && "opacity-60",
      )}
    >
      {/* Header: month nav */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
            Rekap Kehadiran
          </p>
          <h2 className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
            {MONTH_NAMES_ID[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && canJumpToday ? (
            <button
              type="button"
              onClick={onToday}
              className="rounded-full bg-[color:var(--color-brand-50)] px-3 py-1.5 text-xs font-bold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] transition hover:bg-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30"
            >
              Hari ini
            </button>
          ) : null}
          <NavButton label="Bulan sebelumnya" onClick={onPrev} disabled={!canPrev}>
            <ChevronLeft className="size-4" strokeWidth={2.4} />
          </NavButton>
          <NavButton label="Bulan berikutnya" onClick={onNext} disabled={!canNext}>
            <ChevronRight className="size-4" strokeWidth={2.4} />
          </NavButton>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStat value={hadir} label="Hadir" tone="emerald" />
        <SummaryStat value={tidakHadir} label="Tidak hadir" tone="red" />
        <SummaryStat value={`${ratePct}%`} label="Kehadiran" tone="brand" />
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_LABELS_ID.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-400 dark:text-zinc-500"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((cell, i) =>
          cell.day === null || cell.status === null ? (
            <div key={`pad-${i}`} aria-hidden />
          ) : (
            <DayCell key={cell.dateISO ?? i} cell={cell} />
          ),
        )}
      </div>

      {/* Compact legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-4 dark:border-[color:var(--color-surface-border)]">
        {STATUS_LEGEND.map((l) => (
          <span
            key={l.status}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
          >
            <span className={cn("size-2.5 rounded-[4px]", l.swatch)} />
            {l.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function NavButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-zinc-600 ring-1 ring-zinc-200 transition",
        "hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] hover:ring-[color:var(--color-brand-300)]",
        "dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5",
        disabled &&
          "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-zinc-600 hover:ring-zinc-200 dark:hover:bg-transparent dark:hover:text-zinc-300",
      )}
    >
      {children}
    </button>
  );
}

const SUMMARY_TONE: Record<"emerald" | "red" | "brand", string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  red: "text-red-600 dark:text-red-400",
  brand: "text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]",
};

function SummaryStat({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone: "emerald" | "red" | "brand";
}) {
  return (
    <div className="rounded-2xl border border-zinc-100 px-3 py-2.5 dark:border-[color:var(--color-surface-border)]">
      <p className={cn("font-heading text-2xl font-extrabold leading-none", SUMMARY_TONE[tone])}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function DayCell({ cell }: { cell: CalendarDay }) {
  const status = cell.status!;
  const title = cell.holidayLabel
    ? `Tanggal ${cell.day} · Libur: ${cell.holidayLabel}`
    : cell.checkInTime
      ? `Tanggal ${cell.day} · Hadir ${cell.checkInTime} WIB`
      : status === "LUAR_PERIODE"
        ? `Tanggal ${cell.day} · Di luar periode magang`
        : `Tanggal ${cell.day}`;

  return (
    <div
      title={title}
      className={cn(
        "relative flex aspect-square flex-col justify-between rounded-xl p-1.5 transition sm:p-2",
        CALENDAR_STATUS_STYLES[status],
        cell.isToday &&
          "outline outline-2 outline-offset-2 outline-[color:var(--color-brand-500)]",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold sm:text-sm",
          status === "LIBUR" || status === "FUTURE" || status === "LUAR_PERIODE"
            ? "opacity-70"
            : "",
        )}
      >
        {cell.day}
      </span>

      {status === "HADIR" ? (
        <span className="flex items-center justify-between gap-0.5">
          <span className="hidden truncate text-[9px] font-semibold tabular-nums opacity-90 sm:inline">
            {cell.checkInTime}
          </span>
          <Check className="size-3 shrink-0 sm:size-3.5" strokeWidth={3} />
        </span>
      ) : status === "TIDAK_HADIR" ? (
        <span className="flex justify-end">
          <X className="size-3 sm:size-3.5" strokeWidth={3} />
        </span>
      ) : cell.isToday ? (
        <span className="text-[9px] font-bold uppercase tracking-wide text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
          Hari ini
        </span>
      ) : null}
    </div>
  );
}
