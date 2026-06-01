"use client";

import { GraduationCap, Pencil, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  resolveGradeBand,
  TONE_SURFACE,
} from "@/components/internship/final-grade/final-grade-helpers";
import type { AdminGradeRow } from "@/lib/admin-internship-grades-query";

type Props = {
  rows: AdminGradeRow[];
  isFetching?: boolean;
  onEdit: (row: AdminGradeRow) => void;
};

/** First two initials of a name, brand-colored fallback for the avatar. */
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

function PersonCell({ row }: { row: AdminGradeRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {row.image ? <AvatarImage src={row.image} alt={row.name} /> : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(row.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
          {row.name}
        </p>
        {row.institution ? (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {row.institution}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Score number + letter band pill (via the shared grade-band helper), or a
 *  muted "Belum dinilai" when no grade exists yet. */
function GradeCell({ row }: { row: AdminGradeRow }) {
  if (row.grade === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10">
        Belum dinilai
      </span>
    );
  }
  const band = resolveGradeBand(row.grade);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-heading text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
        {row.grade}
      </span>
      <span
        className={cn(
          "inline-flex min-w-9 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ring-1",
          TONE_SURFACE[band.tone],
        )}
      >
        {band.letter}
      </span>
    </span>
  );
}

function GradeAction({
  row,
  onEdit,
}: {
  row: AdminGradeRow;
  onEdit: (r: AdminGradeRow) => void;
}) {
  const isEdit = row.grade !== null;
  return (
    <Button
      type="button"
      size="sm"
      variant={isEdit ? "outline" : "default"}
      onClick={() => onEdit(row)}
      className={cn(
        !isEdit &&
          "bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]",
      )}
    >
      {isEdit ? (
        <Pencil className="size-3.5" strokeWidth={2.4} />
      ) : (
        <Plus className="size-3.5" strokeWidth={2.4} />
      )}
      {isEdit ? "Edit Nilai" : "Beri Nilai"}
    </Button>
  );
}

export function AdminGradesTable({ rows, isFetching, onEdit }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
          <GraduationCap className="size-6" strokeWidth={2} />
        </span>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Tidak ada peserta untuk filter ini.
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
              <th className="px-2 py-3 font-semibold">Nama Peserta</th>
              <th className="px-4 py-3 font-semibold">Kelas</th>
              <th className="px-4 py-3 font-semibold">Nilai Akhir</th>
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
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {row.classLabel}
                </td>
                <td className="px-4 py-3">
                  <GradeCell row={row} />
                </td>
                <td className="px-6 py-3 text-right">
                  <GradeAction row={row} onEdit={onEdit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {rows.map((row, i) => (
          <li key={row.studentId} className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start gap-2">
              <span className="mt-1 font-heading text-xs font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <PersonCell row={row} />
            </div>
            <p className="pl-6 text-xs text-zinc-500 dark:text-zinc-400">
              {row.classLabel}
            </p>
            <div className="flex items-center justify-between pl-6">
              <GradeCell row={row} />
              <GradeAction row={row} onEdit={onEdit} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
