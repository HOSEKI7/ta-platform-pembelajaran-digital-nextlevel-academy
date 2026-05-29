import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  /** Pre-formatted headline value (e.g. "1.284" or "Rp 487.650.000"). */
  value: string;
  /** Tailwind classes for the icon chip (bg + text + ring). */
  accent: string;
  /** Optional breakdown chips rendered under the label. */
  breakdown?: { label: string; count: number }[];
};

/**
 * Single KPI tile for the admin dashboard. Pattern mirrors the mentor dashboard
 * stat tiles, extended with an optional breakdown row (per-role / per-status).
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  breakdown,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-zinc-200",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl ring-1",
            accent,
          )}
        >
          <Icon className="size-6" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-2xl font-extrabold leading-none tabular-nums text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          <p className="mt-1.5 truncate text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {label}
          </p>
        </div>
      </div>

      {breakdown && breakdown.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3 dark:border-[color:var(--color-surface-border)]">
          {breakdown.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300"
            >
              {b.label}
              <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {b.count.toLocaleString("id-ID")}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
