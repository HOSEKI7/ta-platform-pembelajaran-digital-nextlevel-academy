"use client";

import { AlertTriangle, Clock } from "lucide-react";

import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttentionItem } from "@/lib/admin-dashboard-types";

import { ChartCard } from "./chart-card";

type Props = {
  items: AttentionItem[];
};

/**
 * "Perlu perhatian" — PENDING orders nearing their 60-minute auto-expiry
 * (PRD §6.4). Operational widget so the admin can spot stuck payments at a
 * glance. The closer to expiry, the more urgent the accent.
 */
export function AttentionCard({ items }: Props) {
  return (
    <ChartCard
      title="Perlu Perhatian"
      subtitle="Order pending mendekati kedaluwarsa"
      icon={AlertTriangle}
      action={
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30">
          {items.length}
        </span>
      }
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Tidak ada order yang perlu ditindak.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const urgent = item.expiresInMin <= 15;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 ring-1",
                  urgent
                    ? "bg-red-50 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/30"
                    : "bg-zinc-50 ring-zinc-200 dark:bg-white/[0.03] dark:ring-[color:var(--color-surface-border)]",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {item.user}
                  </p>
                  <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                    {item.course} · {idr.format(item.amount)}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ring-1",
                    urgent
                      ? "bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/30"
                      : "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30",
                  )}
                >
                  <Clock className="size-3" strokeWidth={2.4} />
                  {item.expiresInMin} mnt
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}
