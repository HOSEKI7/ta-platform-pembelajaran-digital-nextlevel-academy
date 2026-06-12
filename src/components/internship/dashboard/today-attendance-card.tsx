"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import { describeOff } from "@/components/internship/attendance/attendance-data";

import type {
  AttendanceDisplayStatus,
  DayMark,
  Last7Status,
  MonthSummary,
  TodayOff,
} from "@/lib/internship-types";

type Props = {
  status: AttendanceDisplayStatus;
  /** ISO check-in timestamp, or null when not yet present. */
  checkInLabel: string | null;
  /** Non-null on a non-working day → a clear "Libur" pill instead of "Belum absen". */
  off: TodayOff | null;
  monthSummary: MonthSummary;
  last7: DayMark[];
};

const STATUS_META: Record<
  AttendanceDisplayStatus,
  { label: string; pill: string; dot: string }
> = {
  HADIR: {
    label: "Hadir",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  BELUM: {
    label: "Belum absen",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
    dot: "bg-zinc-400",
  },
  TIDAK_HADIR: {
    label: "Tidak hadir",
    pill: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
};

const DOT_COLOR: Record<Last7Status, string> = {
  HADIR: "bg-emerald-500",
  BELUM: "bg-zinc-300 dark:bg-white/20",
  TIDAK_HADIR: "bg-red-500",
  LIBUR: "bg-zinc-200 dark:bg-white/10",
};

export function TodayAttendanceCard({
  status,
  checkInLabel,
  off,
  monthSummary,
  last7,
}: Props) {
  const offCopy = off ? describeOff(off) : null;
  // A neutral "Libur" pill replaces the tri-state status on a day off.
  const meta = offCopy
    ? {
        label: offCopy.pill,
        pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
        dot: "bg-zinc-400",
      }
    : STATUS_META[status];
  const ratePct = monthSummary.totalDays
    ? Math.round((monthSummary.presentDays / monthSummary.totalDays) * 100)
    : 0;

  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <CalendarCheck className="size-5" strokeWidth={2.2} />
          </span>
          <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
            Absensi Hari Ini
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1",
            meta.pill,
          )}
        >
          <span className={cn("size-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>

      <div className="rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
          {offCopy ? "Status hari ini" : "Waktu check-in"}
        </p>
        <p
          className={cn(
            "mt-0.5 font-heading font-extrabold text-zinc-900 dark:text-zinc-50",
            offCopy ? "text-xl" : "text-2xl",
          )}
        >
          {offCopy ? offCopy.heading : checkInLabel ? `${checkInLabel} WIB` : "—:—"}
        </p>
      </div>

      {/* Monthly mini-summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-100 p-3 dark:border-[color:var(--color-surface-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Bulan ini
          </p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="font-heading text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {monthSummary.presentDays}
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              / {monthSummary.totalDays} hari
            </span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[color:var(--color-brand-500)]"
              style={{ width: `${ratePct}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-100 p-3 dark:border-[color:var(--color-surface-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Streak
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <Flame className="size-5 text-[color:var(--color-warning)]" strokeWidth={2.2} />
            <span className="font-heading text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {monthSummary.streakDays}
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              hari
            </span>
          </p>
        </div>
      </div>

      {/* Last 7 days */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
          7 hari terakhir
        </p>
        <div className="flex items-end justify-between gap-1.5">
          {last7.map((d, i) => (
            <div key={`${d.label}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
              <span className={cn("h-7 w-full rounded-md", DOT_COLOR[d.status])} />
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/internship/attendance"
        className="group inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-brand-700)] transition hover:gap-1.5 dark:text-[color:var(--color-brand-300)]"
      >
        Lihat rekap absensi lengkap
        <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
      </Link>
    </section>
  );
}
