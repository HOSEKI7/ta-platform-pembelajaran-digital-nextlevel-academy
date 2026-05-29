"use client";

import { Download, MessageSquarePlus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/internship/tasks/task-status-badge";
import type { MentorSubmissionRow } from "@/lib/mentor-types";

type Props = {
  rows: MentorSubmissionRow[];
  onProvideFeedback: (row: MentorSubmissionRow) => void;
};

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "NL"
  );
}

function PersonCell({ row }: { row: MentorSubmissionRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {row.image ? <AvatarImage src={row.image} alt={row.name} /> : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(row.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
        {row.name}
      </span>
    </div>
  );
}

/** Download + feedback actions for a single row (shared desktop/mobile). */
function RowActions({
  row,
  onProvideFeedback,
}: {
  row: MentorSubmissionRow;
  onProvideFeedback: (row: MentorSubmissionRow) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {row.file?.url ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={row.file.url} target="_blank" rel="noopener noreferrer" />}
        >
          <Download className="size-3.5" strokeWidth={2.4} />
          Berkas
        </Button>
      ) : (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">— tanpa berkas</span>
      )}
      {row.status === "TERKUMPUL" ? (
        <Button
          size="sm"
          className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
          onClick={() => onProvideFeedback(row)}
        >
          <MessageSquarePlus className="size-3.5" strokeWidth={2.4} />
          Beri Feedback
        </Button>
      ) : null}
    </div>
  );
}

/** Class-wide submission roster for a task. Desktop table + mobile card stack. */
export function SubmissionsTable({ rows, onProvideFeedback }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
        <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
          <Users className="size-5" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
            Pengumpulan Peserta
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Status pengumpulan seluruh peserta di kelas
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Belum ada peserta di kelas ini.
        </p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:border-[color:var(--color-surface-border)] dark:text-zinc-500">
                  <th className="w-14 px-6 py-3 text-center font-semibold">No.</th>
                  <th className="px-2 py-3 font-semibold">Nama Peserta</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.studentId}
                    className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-3">
                      <PersonCell row={row} />
                    </td>
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end">
                        <RowActions row={row} onProvideFeedback={onProvideFeedback} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <ul className="divide-y divide-zinc-50 sm:hidden dark:divide-white/[0.04]">
            {rows.map((row, i) => (
              <li key={row.studentId} className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className={cn("font-heading text-xs font-bold tabular-nums text-zinc-300 dark:text-zinc-600")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <PersonCell row={row} />
                </div>
                <div className="flex items-center justify-between gap-3 pl-1">
                  <TaskStatusBadge status={row.status} />
                  <RowActions row={row} onProvideFeedback={onProvideFeedback} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
