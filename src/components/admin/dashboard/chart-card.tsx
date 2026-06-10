import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Optional node rendered in the header's right corner (e.g. a total). */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/**
 * Shared card chrome for every dashboard panel (charts, lists, tables). Keeps
 * the header treatment consistent across the grid and out of each chart file.
 */
export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
  children,
}: Props) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <Icon className="size-5" strokeWidth={2.2} />
            </span>
          ) : null}
          <div>
            <h2 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0 text-right">{action}</div> : null}
      </header>

      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}
