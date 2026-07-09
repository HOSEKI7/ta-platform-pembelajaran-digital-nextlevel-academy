import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { PendingTask } from "@/lib/internship-types";

const WIB_TZ = "Asia/Jakarta";

type Props = {
  tasks: PendingTask[];
  /** Server-captured "now" for deterministic urgency across hydration. */
  serverNowISO: string;
};

type Tone = "danger" | "warning" | "muted";

function urgencyFor(deadlineISO: string, now: Date): { text: string; tone: Tone } {
  const hours = (new Date(deadlineISO).getTime() - now.getTime()) / 3_600_000;
  if (hours < 0) return { text: "Lewat deadline", tone: "danger" };
  if (hours < 24) {
    return { text: `${Math.max(1, Math.round(hours))} jam lagi`, tone: "danger" };
  }
  const days = Math.ceil(hours / 24);
  return { text: `${days} hari lagi`, tone: days <= 2 ? "warning" : "muted" };
}

const TONE_PILL: Record<Tone, string> = {
  danger:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  muted:
    "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15",
};

export function PendingTasksCard({ tasks, serverNowISO }: Props) {
  const now = new Date(serverNowISO);

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <ClipboardList className="size-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
              Tugas Menunggu
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Selesaikan sebelum deadline
            </p>
          </div>
        </div>
        {tasks.length > 0 ? (
          <span className="grid min-w-7 place-items-center rounded-full bg-[color:var(--color-brand-500)] px-2 py-1 text-xs font-bold text-white">
            {tasks.length}
          </span>
        ) : null}
      </div>

      {tasks.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center dark:border-[color:var(--color-surface-border)]">
          <CheckCircle2 className="size-8 text-[color:var(--color-success)]" strokeWidth={2} />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Tidak ada tugas tertunda
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Semua tugasmu sudah dikumpulkan. Kerja bagus!
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {tasks.map((task) => {
            const urgency = urgencyFor(task.deadlineISO, now);
            const deadlineLabel = formatInTimeZone(
              new Date(task.deadlineISO),
              WIB_TZ,
              "dd/MM/yyyy · HH:mm",
            );
            return (
              <li key={task.id}>
                <Link
                  href={`/internship/tasks/${task.id}`}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border border-zinc-100 p-3.5 transition",
                    "hover:border-[color:var(--color-brand-200)] hover:bg-[color:var(--color-brand-50)]/50",
                    "dark:border-[color:var(--color-surface-border)] dark:hover:border-[color:var(--color-brand-400)]/40 dark:hover:bg-white/[0.03]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-10 w-1 shrink-0 rounded-full",
                      urgency.tone === "danger"
                        ? "bg-red-500"
                        : urgency.tone === "warning"
                          ? "bg-amber-500"
                          : "bg-[color:var(--color-brand-400)]",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <CalendarClock className="size-3.5 shrink-0" strokeWidth={2} />
                      <span className="truncate">{deadlineLabel} WIB</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                        TONE_PILL[urgency.tone],
                      )}
                    >
                      {urgency.text}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                      Belum dikumpulkan
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/internship/tasks"
        className="group mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-brand-700)] transition hover:gap-1.5 dark:text-[color:var(--color-brand-300)]"
      >
        Lihat semua tugas
        <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
      </Link>
    </section>
  );
}
