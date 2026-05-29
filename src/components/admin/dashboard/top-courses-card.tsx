"use client";

import { Flame } from "lucide-react";

import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TopCourse } from "@/lib/admin-dashboard-types";

import { ChartCard } from "./chart-card";

type Props = {
  courses: TopCourse[];
};

/**
 * Best-selling courses (PRD §6.11.2). A CSS horizontal-bar ranking — lighter
 * than a full Recharts chart and reads better with the per-course revenue line.
 */
export function TopCoursesCard({ courses }: Props) {
  const max = Math.max(1, ...courses.map((c) => c.sold));

  return (
    <ChartCard title="Kursus Terlaris" subtitle="Berdasarkan jumlah terjual" icon={Flame}>
      <ol className="flex flex-col gap-4">
        {courses.map((course, i) => (
          <li key={course.title}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md text-[11px] font-bold tabular-nums",
                    i === 0
                      ? "bg-[color:var(--color-brand-accent)] text-[color:var(--color-brand-950)]"
                      : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
                  )}
                >
                  {i + 1}
                </span>
                <span className="truncate">{course.title}</span>
              </p>
              <span className="shrink-0 text-xs font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {course.sold.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-brand-700)]"
                  style={{ width: `${(course.sold / max) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                {idr.format(course.revenue)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
