import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ArrowUpRight, CalendarClock, Paperclip, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MentorTaskRow } from "@/lib/mentor-types";
import {
  urgencyFor,
  type UrgencyTone,
} from "@/components/internship/tasks/task-helpers";

const WIB_TZ = "Asia/Jakarta";

const ACCENT_BAR: Record<UrgencyTone, string> = {
  danger: "bg-red-500",
  warning: "bg-amber-500",
  muted: "bg-[color:var(--color-brand-400)]",
};

const URGENCY_PILL: Record<UrgencyTone, string> = {
  danger:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  muted:
    "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
};

type Props = {
  task: MentorTaskRow;
  /** Server-captured "now" so urgency is deterministic across hydration. */
  now: Date;
};

/**
 * A single task tile in the mentor "Kelola Tugas" grid. Mirrors the intern
 * `TaskCard` shape but, instead of a personal submission status, foregrounds the
 * class-wide submission progress ("x/total siswa"). Links to the (future)
 * detail / review page.
 */
export function MentorTaskCard({ task, now }: Props) {
  const urgency = urgencyFor(task.deadlineISO, now);
  const deadlineLabel = formatInTimeZone(
    new Date(task.deadlineISO),
    WIB_TZ,
    "dd/MM/yyyy · HH:mm",
  );
  const pct =
    task.totalStudents > 0
      ? Math.round((task.submittedCount / task.totalStudents) * 100)
      : 0;
  const complete = task.totalStudents > 0 && task.submittedCount >= task.totalStudents;

  return (
    <Link
      href={`/mentor/tasks/${task.id}`}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-zinc-200 transition",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_rgba(34,91,215,0.45)] hover:ring-[color:var(--color-brand-200)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/40",
      )}
    >
      {/* Left accent rail keyed to urgency */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          urgency.overdue ? "bg-zinc-300 dark:bg-white/15" : ACCENT_BAR[urgency.tone],
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
          <CalendarClock className="size-3.5 shrink-0" strokeWidth={2} />
          {deadlineLabel} WIB
        </span>
        {!urgency.overdue ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
              URGENCY_PILL[urgency.tone],
            )}
          >
            {urgency.text}
          </span>
        ) : (
          <span className="shrink-0 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
            {urgency.text}
          </span>
        )}
      </div>

      <h3 className="font-heading text-base font-bold leading-snug text-zinc-900 line-clamp-2 dark:text-zinc-100">
        {task.title}
      </h3>

      {/* Submission progress — the mentor's primary signal */}
      <div className="mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-zinc-500 dark:text-zinc-400">
            <Users className="size-3.5 shrink-0" strokeWidth={2} />
            Progres pengumpulan
          </span>
          <span className="font-heading font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
            {task.submittedCount}
            <span className="font-semibold text-zinc-400 dark:text-zinc-500">
              /{task.totalStudents} siswa
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                complete
                  ? "bg-emerald-500"
                  : "bg-[color:var(--color-brand-500)]",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span
            className={cn(
              "shrink-0 text-[11px] font-bold tabular-nums",
              complete
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {pct}%
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-[color:var(--color-surface-border)]">
        {task.hasAttachment ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <Paperclip className="size-3.5" strokeWidth={2} />
            1 lampiran
          </span>
        ) : (
          <span className="text-[11px] font-medium text-zinc-300 dark:text-zinc-600">
            Tanpa lampiran
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-brand-700)] transition group-hover:gap-1.5 dark:text-[color:var(--color-brand-300)]">
          Kelola
          <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  );
}
