"use client";

import { useMemo, useState } from "react";
import { Layers, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { BatchRow } from "@/lib/admin-internship-config-query";
import { cn } from "@/lib/utils";
import { useDeleteBatchMutation } from "@/hooks/use-admin-internship-config-actions";

import { DeleteConfigDialog } from "./delete-config-dialog";
import { PLAIN_TH, SortHeader, useSortState } from "./table-sort";
import { CountChip } from "./count-chip";

type Props = {
  rows: BatchRow[];
  isFetching: boolean;
  onEdit: (row: BatchRow) => void;
};

type SortKey = "name" | "period" | "fields";

function compare(key: SortKey, a: BatchRow, b: BatchRow): number {
  switch (key) {
    case "period":
      return a.startDate.localeCompare(b.startDate);
    case "fields":
      return a.fieldCount - b.fieldCount;
    case "name":
    default:
      return a.name.localeCompare(b.name, "id");
  }
}

function formatDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function BatchesTable({ rows, isFetching, onEdit }: Props) {
  const { key, dir, toggle } = useSortState<SortKey>("name");
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
              <SortHeader label="Nama Batch" active={key === "name"} dir={dir} onClick={() => toggle("name")} />
              <th className={PLAIN_TH}>Kode</th>
              <th className={PLAIN_TH}>Keterangan</th>
              <SortHeader label="Periode" active={key === "period"} dir={dir} onClick={() => toggle("period")} />
              <SortHeader label="Bidang" active={key === "fields"} dir={dir} onClick={() => toggle("fields")} align="center" />
              <th className={cn(PLAIN_TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
              >
                  <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</p>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                    {r.kodeBatch ?? "\u2014"}
                  </code>
                </td>
                <td className="max-w-96 px-4 py-3">
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{r.description}</p>
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {formatDMY(r.startDate)} – {formatDMY(r.endDate)}
                </td>
                <td className="px-4 py-3 text-center">
                  <CountChip value={r.fieldCount} />
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
              <Layers className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</p>
              {r.kodeBatch && (
                <p className="text-xs font-mono text-zinc-400">
                  Kode: {r.kodeBatch}
                </p>
              )}
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {formatDMY(r.startDate)} – {formatDMY(r.endDate)} · {r.fieldCount} bidang
              </p>
            </div>
            <RowActions row={r} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RowActions({ row, onEdit }: { row: BatchRow; onEdit: (row: BatchRow) => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteBatchMutation();

  const blocked = row.fieldCount > 0;

  const handleDelete = () => {
    setError(null);
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success("Batch dihapus.");
        setConfirmOpen(false);
      },
      onError: (err) => setError(err instanceof Error ? err.message : "Gagal menghapus batch."),
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
        entityLabel="batch"
        itemName={row.name}
        blocked={blocked}
        blockedHint={
          blocked
            ? `Batch ini masih memiliki ${row.fieldCount} bidang — hapus atau pindahkan dulu seluruh bidang di batch ini.`
            : undefined
        }
        deleting={deleteMutation.isPending}
        error={error}
        onConfirm={handleDelete}
      />
    </div>
  );
}
