import { CalendarCheck, ClipboardCheck, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPercentage } from "@/components/internship/final-grade/final-grade-helpers";
import type { PerformanceSummary as PerformanceSummaryDTO } from "@/lib/internship-final-grade-types";

type Props = { summary: PerformanceSummaryDTO };

/**
 * Two compact KPI cards summarising attendance + task completion. PRD §6.9.4
 * defines the final grade as a single mentor-input integer, so these are
 * deliberately framed as "statistik pendukung" — non-formal context, not part
 * of the formal score.
 */
export function PerformanceSummary({ summary }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Performa Magang
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Referensi
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <KpiCard
          icon={CalendarCheck}
          title="Kehadiran"
          numerator={summary.attendance.present}
          denominator={summary.attendance.expected}
          unit="hari kerja"
          percentage={summary.attendance.percentage}
          captionWhenEmpty="Periode magang belum mencatat hari kerja apa pun."
        />
        <KpiCard
          icon={ClipboardCheck}
          title="Tugas"
          numerator={summary.tasks.submitted}
          denominator={summary.tasks.total}
          unit="tugas"
          percentage={summary.tasks.percentage}
          captionWhenEmpty="Mentor belum membuat tugas untuk kelasmu."
        />
      </div>

      <p className="flex items-start gap-2 rounded-2xl bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-500 ring-1 ring-zinc-100 dark:bg-white/[0.03] dark:text-zinc-400 dark:ring-white/5">
        <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
        Statistik di atas bersifat pendukung. Nilai akhir resmi sepenuhnya
        ditentukan oleh mentor berdasarkan keseluruhan kontribusi peserta.
      </p>
    </section>
  );
}

type KpiCardProps = {
  icon: LucideIcon;
  title: string;
  numerator: number;
  denominator: number;
  unit: string;
  percentage: number;
  captionWhenEmpty: string;
};

function KpiCard({
  icon: Icon,
  title,
  numerator,
  denominator,
  unit,
  percentage,
  captionWhenEmpty,
}: KpiCardProps) {
  const isEmpty = denominator === 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-zinc-200",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]",
              "dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-300)]",
            )}
          >
            <Icon className="size-5" strokeWidth={2} />
          </span>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset",
            isEmpty
              ? "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10"
              : "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
          )}
        >
          {formatPercentage(percentage)}
        </span>
      </div>

      {isEmpty ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{captionWhenEmpty}</p>
      ) : (
        <>
          <p className="font-heading text-2xl font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
            {numerator}
            <span className="ml-1 text-base font-semibold text-zinc-400 dark:text-zinc-500">
              / {denominator} {unit}
            </span>
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-[color:var(--color-brand-500)] transition-[width] duration-500 ease-out"
              style={{ width: `${percentage}%` }}
              aria-hidden
            />
          </div>
        </>
      )}
    </div>
  );
}
