import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ArrowUpRight, CalendarClock, Paperclip, User } from "lucide-react";

import { cn } from "@/lib/utils";

import { TaskStatusBadge } from "./task-status-badge";
import {
  resolveStatus,
  urgencyFor,
  type MagangTask,
  type UrgencyTone,
} from "./task-helpers";

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
  task: MagangTask;
  /** Server-captured "now" so urgency is deterministic across hydration. */
  now: Date;
};

/** A single task tile in the `/internship/tasks` grid. Links to the detail. */
export function TaskCard({ task, now }: Props) {
  const status = resolveStatus(task, now);
  const urgency = urgencyFor(task.deadlineISO, now);
  const deadlineLabel = formatInTimeZone(
    new Date(task.deadlineISO),
    WIB_TZ,
    "dd/MM/yyyy · HH:mm",
  );

  return (
    <Link
      href={`/internship/tasks/${task.id}`}
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
        <TaskStatusBadge status={status} />
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

      <div className="mt-auto flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <User className="size-3.5 shrink-0" strokeWidth={2} />
          <span className="truncate">{task.mentorName}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5 shrink-0" strokeWidth={2} />
          <span className="truncate">{deadlineLabel} WIB</span>
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-[color:var(--color-surface-border)]">
        {task.attachment ? (
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
          Lihat detail
          <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  );
}
