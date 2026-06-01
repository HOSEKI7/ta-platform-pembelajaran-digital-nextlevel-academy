"use client";

import { Check, Clock3, UsersRound, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttendanceStatusPill } from "@/components/mentor/student-attendance/attendance-status-pill";
import type {
  AdminAttendanceRow,
  SettableStatus,
} from "@/lib/admin-internship-attendance-query";

type Props = {
  rows: AdminAttendanceRow[];
  /** When the selected day isn't a working day, statuses show as neutral. */
  neutralLabel: string | null;
  isFetching?: boolean;
  onAct: (row: AdminAttendanceRow, target: SettableStatus) => void;
};

/** First two initials of a name; brand-colored avatar fallback. */
function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "NL"
  );
}

function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 45}ms`;
}

function PersonCell({ row }: { row: AdminAttendanceRow }) {
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

function CheckInTime({ value }: { value: string | null }) {
  if (!value) {
    return <span className="text-sm text-zinc-300 dark:text-zinc-600">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-zinc-600 dark:text-zinc-300">
      <Clock3 className="size-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
      {value} WIB
    </span>
  );
}

/** Two-button toggle: highlight current state, click the other to override. */
function ActionCell({
  row,
  onAct,
}: {
  row: AdminAttendanceRow;
  onAct: (row: AdminAttendanceRow, target: SettableStatus) => void;
}) {
  if (!row.editable) {
    return (
      <span className="text-xs font-medium text-zinc-300 dark:text-zinc-600">
        Tidak dapat diubah
      </span>
    );
  }

  const isHadir = row.status === "HADIR";
  const isTidak = row.status === "TIDAK_HADIR";

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100/80 p-1 dark:bg-white/5">
      <button
        type="button"
        onClick={() => onAct(row, "HADIR")}
        disabled={isHadir}
        aria-label={`Tandai ${row.name} hadir`}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition",
          isHadir
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300",
        )}
      >
        <Check className="size-3.5" strokeWidth={2.6} />
        Hadir
      </button>
      <button
        type="button"
        onClick={() => onAct(row, "TIDAK_HADIR")}
        disabled={isTidak}
        aria-label={`Tandai ${row.name} tidak hadir`}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition",
          isTidak
            ? "bg-red-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-red-50 hover:text-red-700 dark:text-zinc-300 dark:hover:bg-red-500/15 dark:hover:text-red-300",
        )}
      >
        <X className="size-3.5" strokeWidth={2.6} />
        Tidak Hadir
      </button>
    </div>
  );
}

export function AttendanceTable({ rows, neutralLabel, isFetching, onAct }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
          <UsersRound className="size-6" strokeWidth={2} />
        </span>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Tidak ada data untuk filter ini.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("transition-opacity", isFetching && "opacity-60")}>
      {/* Desktop: semantic table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:border-[color:var(--color-surface-border)] dark:text-zinc-500">
              <th className="w-14 px-6 py-3 text-center font-semibold">No.</th>
              <th className="px-2 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Kelas</th>
              <th className="px-4 py-3 font-semibold">Waktu</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.userId}
                style={{ animationDelay: rowDelay(i) }}
                className={cn(
                  "border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80",
                  "dark:border-white/[0.04] dark:hover:bg-white/[0.03]",
                  "fade-in-0 slide-in-from-bottom-1 fill-mode-both animate-in duration-500",
                )}
              >
                <td className="px-6 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-2 py-3">
                  <PersonCell row={row} />
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {row.classLabel}
                </td>
                <td className="px-4 py-3">
                  <CheckInTime value={row.checkInTime} />
                </td>
                <td className="px-4 py-3">
                  {neutralLabel ? (
                    <AttendanceStatusPill neutralLabel={neutralLabel} />
                  ) : (
                    <AttendanceStatusPill status={row.status} />
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <ActionCell row={row} onAct={onAct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet: stacked cards */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {rows.map((row, i) => (
          <li
            key={row.userId}
            style={{ animationDelay: rowDelay(i) }}
            className="fade-in-0 slide-in-from-bottom-1 fill-mode-both flex animate-in flex-col gap-3 px-5 py-4 duration-500"
          >
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <PersonCell row={row} />
            </div>
            <p className="pl-1 text-xs text-zinc-500 dark:text-zinc-400">
              {row.classLabel}
            </p>
            <div className="flex items-center justify-between pl-1">
              <CheckInTime value={row.checkInTime} />
              {neutralLabel ? (
                <AttendanceStatusPill neutralLabel={neutralLabel} />
              ) : (
                <AttendanceStatusPill status={row.status} />
              )}
            </div>
            <div className="pl-1">
              <ActionCell row={row} onAct={onAct} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
