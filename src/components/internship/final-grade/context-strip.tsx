import { CalendarRange, GraduationCap, Layers3, UserRoundCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPeriodLabel } from "@/components/internship/final-grade/final-grade-helpers";
import type { InternshipPeriod, MagangContext } from "@/lib/internship-types";

type Props = {
  context: MagangContext;
  period: InternshipPeriod;
};

type Cell = { icon: LucideIcon; label: string; value: string };

/**
 * 4-cell info strip — Mentor, Batch, Kelas, Periode. Read-only context for
 * the grade hero; kept visually quiet so the score stays the focal point.
 */
export function ContextStrip({ context, period }: Props) {
  const cells: Cell[] = [
    { icon: UserRoundCog, label: "Mentor", value: context.mentorName },
    { icon: Layers3, label: "Batch & Bidang", value: `${context.batchLabel} · ${context.fieldLabel}` },
    { icon: GraduationCap, label: "Kelas", value: `Kelas ${context.section}` },
    {
      icon: CalendarRange,
      label: "Periode magang",
      value: formatPeriodLabel(period.startISO, period.endISO),
    },
  ];

  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-3 rounded-3xl bg-white p-3 ring-1 ring-zinc-200 sm:grid-cols-2 sm:p-4 lg:grid-cols-4",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      {cells.map((cell) => (
        <ContextCell key={cell.label} {...cell} />
      ))}
    </section>
  );
}

function ContextCell({ icon: Icon, label, value }: Cell) {
  return (
    <div className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]",
          "dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-300)]",
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
      </div>
    </div>
  );
}
