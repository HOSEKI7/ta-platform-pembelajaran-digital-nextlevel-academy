"use client";

import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";
import { CalendarClock, ClipboardList, Eye, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AdminTaskRow } from "@/lib/admin-internship-tasks-query";

const WIB_TZ = "Asia/Jakarta";

type Props = {
  rows: AdminTaskRow[];
  isFetching?: boolean;
  onDelete: (row: AdminTaskRow) => void;
};

function fmtDate(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy", { locale: idLocale });
}
function fmtDateTime(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy · HH:mm", {
    locale: idLocale,
  });
}

/** Lifecycle pill: green "Aktif" while the deadline is in the future, else red. */
function StatusPill({ status }: { status: AdminTaskRow["status"] }) {
  const active = status === "AKTIF";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
          : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-red-500")} />
      {active ? "Aktif" : "Overdue"}
    </span>
  );
}

function RowActions({ row, onDelete }: { row: AdminTaskRow; onDelete: (r: AdminTaskRow) => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/admin/internship/tasks/${row.id}`} />}
      >
        <Eye className="size-3.5" strokeWidth={2.4} />
        Detail
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/15"
        onClick={() => onDelete(row)}
        aria-label={`Hapus tugas ${row.title}`}
      >
        <Trash2 className="size-3.5" strokeWidth={2.4} />
        Hapus
      </Button>
    </div>
  );
}

export function AdminTasksTable({ rows, isFetching, onDelete }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
          <ClipboardList className="size-6" strokeWidth={2} />
        </span>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Tidak ada tugas untuk filter ini.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("transition-opacity", isFetching && "opacity-60")}>
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:border-[color:var(--color-surface-border)] dark:text-zinc-500">
              <th className="w-14 px-6 py-3 text-center font-semibold">No.</th>
              <th className="px-2 py-3 font-semibold">Nama Tugas</th>
              <th className="px-4 py-3 font-semibold">Kelas</th>
              <th className="px-4 py-3 font-semibold">Dibuat</th>
              <th className="px-4 py-3 font-semibold">Tenggat</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
              >
                <td className="px-6 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-2 py-3">
                  <Link
                    href={`/admin/internship/tasks/${row.id}`}
                    className="font-semibold text-zinc-900 transition hover:text-[color:var(--color-brand-700)] dark:text-zinc-100 dark:hover:text-[color:var(--color-brand-300)]"
                  >
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {row.classLabel}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                  {fmtDate(row.createdAtISO)}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-zinc-400" strokeWidth={2} />
                    {fmtDateTime(row.deadlineISO)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-6 py-3">
                  <RowActions row={row} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {rows.map((row, i) => (
          <li key={row.id} className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 font-heading text-xs font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/internship/tasks/${row.id}`}
                    className="block truncate font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {row.title}
                  </Link>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {row.classLabel}
                  </p>
                </div>
              </div>
              <StatusPill status={row.status} />
            </div>
            <dl className="grid grid-cols-2 gap-2 pl-6 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                <dt className="font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Dibuat
                </dt>
                <dd className="tabular-nums">{fmtDate(row.createdAtISO)}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Tenggat
                </dt>
                <dd className="tabular-nums">{fmtDateTime(row.deadlineISO)}</dd>
              </div>
            </dl>
            <div className="pl-6">
              <RowActions row={row} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
