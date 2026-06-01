"use client";

import { useMemo, useState } from "react";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { FieldRow } from "@/lib/admin-internship-config-query";
import { cn } from "@/lib/utils";
import { useDeleteFieldMutation } from "@/hooks/use-admin-internship-config-actions";

import { DeleteConfigDialog } from "./delete-config-dialog";
import { PLAIN_TH, SortHeader, useSortState } from "./table-sort";
import { CountChip } from "./count-chip";

type Props = {
  rows: FieldRow[];
  isFetching: boolean;
  onEdit: (row: FieldRow) => void;
};

type SortKey = "batch" | "name" | "classes";

function compare(key: SortKey, a: FieldRow, b: FieldRow): number {
  switch (key) {
    case "batch":
      return a.batchName.localeCompare(b.batchName, "id") || a.name.localeCompare(b.name, "id");
    case "classes":
      return a.classCount - b.classCount;
    case "name":
    default:
      return a.name.localeCompare(b.name, "id");
  }
}

export function FieldsTable({ rows, isFetching, onEdit }: Props) {
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
              <SortHeader label="Nama Bidang" active={key === "name"} dir={dir} onClick={() => toggle("name")} />
              <SortHeader label="Kelas" active={key === "classes"} dir={dir} onClick={() => toggle("classes")} align="center" />
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
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <CountChip value={r.classCount} />
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
              <FolderTree className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {r.batchName} · {r.classCount} kelas
              </p>
            </div>
            <RowActions row={r} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RowActions({ row, onEdit }: { row: FieldRow; onEdit: (row: FieldRow) => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteFieldMutation();

  const blocked = row.classCount > 0;

  const handleDelete = () => {
    setError(null);
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success("Bidang dihapus.");
        setConfirmOpen(false);
      },
      onError: (err) => setError(err instanceof Error ? err.message : "Gagal menghapus bidang."),
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(row)}
        aria-label={`Edit ${row.name}`}
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
        aria-label={`Hapus ${row.name}`}
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
        entityLabel="bidang"
        itemName={row.name}
        blocked={blocked}
        blockedHint={
          blocked
            ? `Bidang ini masih memiliki ${row.classCount} kelas — hapus dulu kelas di bidang ini.`
            : undefined
        }
        deleting={deleteMutation.isPending}
        error={error}
        onConfirm={handleDelete}
      />
    </div>
  );
}
