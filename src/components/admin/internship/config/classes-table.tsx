"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ClassRow } from "@/lib/admin-internship-config-query";
import { cn } from "@/lib/utils";
import { useDeleteClassMutation } from "@/hooks/use-admin-internship-config-actions";

import { DeleteConfigDialog } from "./delete-config-dialog";
import { PLAIN_TH, SortHeader, useSortState } from "./table-sort";

type Props = {
  rows: ClassRow[];
  isFetching: boolean;
  onEdit: (row: ClassRow) => void;
};

type SortKey = "batch" | "field" | "letter" | "students";

function compare(key: SortKey, a: ClassRow, b: ClassRow): number {
  switch (key) {
    case "batch":
      return (
        a.batchName.localeCompare(b.batchName, "id") ||
        a.fieldName.localeCompare(b.fieldName, "id") ||
        a.letter.localeCompare(b.letter)
      );
    case "field":
      return a.fieldName.localeCompare(b.fieldName, "id") || a.letter.localeCompare(b.letter);
    case "students":
      return a.studentCount - b.studentCount;
    case "letter":
    default:
      return a.letter.localeCompare(b.letter);
  }
}

export function ClassesTable({ rows, isFetching, onEdit }: Props) {
  const { key, dir, toggle } = useSortState<SortKey>("batch");
  const sorted = useMemo(() => {
    const f = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => f * compare(key, a, b));
  }, [rows, key, dir]);

  return (
    <div className={cn("transition-opacity", isFetching && "pointer-events-none opacity-60")}>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={cn(PLAIN_TH, "w-16")}>No</th>
              <SortHeader label="Batch" active={key === "batch"} dir={dir} onClick={() => toggle("batch")} />
              <SortHeader label="Bidang" active={key === "field"} dir={dir} onClick={() => toggle("field")} />
              <SortHeader label="Kelas" active={key === "letter"} dir={dir} onClick={() => toggle("letter")} />
              <SortHeader label="Jumlah Peserta" active={key === "students"} dir={dir} onClick={() => toggle("students")} align="center" />
              <th className={cn(PLAIN_TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={r.id}
                className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">{r.batchName}</td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">{r.fieldName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-lg bg-[color:var(--color-brand-50)] px-2.5 py-1 text-sm font-bold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
                    Kelas {r.letter}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <PeopleChip current={r.studentCount} max={r.maxStudents} />
                </td>
                <td className="px-4 py-3">
                  <RowActions row={r} onEdit={onEdit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {sorted.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <GraduationCap className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                Kelas {r.letter} · {r.fieldName}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {r.batchName} · {r.studentCount}/{r.maxStudents} peserta
              </p>
            </div>
            <RowActions row={r} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PeopleChip({ current, max }: { current: number; max: number }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
        current > 0
          ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]"
          : "bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500",
      )}
    >
      {current}/{max}
    </span>
  );
}

function RowActions({ row, onEdit }: { row: ClassRow; onEdit: (row: ClassRow) => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteClassMutation();

  const blocked = row.studentCount > 0;

  const handleDelete = () => {
    setError(null);
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success("Kelas dihapus.");
        setConfirmOpen(false);
      },
      onError: (err) => setError(err instanceof Error ? err.message : "Gagal menghapus kelas."),
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(row)}
        aria-label={`Edit Kelas ${row.letter}`}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] transition hover:bg-[color:var(--color-brand-50)] dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30 dark:hover:bg-[color:var(--color-brand-500)]/10"
      >
        <Pencil className="size-3.5" strokeWidth={2.4} />
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        aria-label={`Hapus Kelas ${row.letter}`}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 dark:text-red-300 dark:ring-red-500/30 dark:hover:bg-red-500/10"
      >
        <Trash2 className="size-3.5" strokeWidth={2.4} />
        Hapus
      </button>

      <DeleteConfigDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setError(null);
        }}
        entityLabel="kelas"
        itemName={`${row.batchName} · ${row.fieldName} · Kelas ${row.letter}`}
        blocked={blocked}
        blockedHint={
          blocked
            ? `Kelas ini masih memiliki ${row.studentCount} peserta — pindahkan dulu sebelum menghapus.`
            : undefined
        }
        deleting={deleteMutation.isPending}
        error={error}
        onConfirm={handleDelete}
      />
    </div>
  );
}
