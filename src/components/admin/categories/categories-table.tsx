"use client";

import { useState } from "react";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { AdminCategoryRow } from "@/lib/admin-categories-query";
import { cn } from "@/lib/utils";
import { useDeleteCategoryMutation } from "@/hooks/use-admin-category-actions";

import { DeleteCategoryDialog } from "./delete-category-dialog";

type Props = {
  rows: AdminCategoryRow[];
  isFetching: boolean;
  onEdit: (row: AdminCategoryRow) => void;
};

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function CategoriesTable({ rows, isFetching, onEdit }: Props) {
  return (
    <div
      className={cn(
        "transition-opacity",
        isFetching && "pointer-events-none opacity-60",
      )}
    >
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={TH}>Nama</th>
              <th className={TH}>Deskripsi</th>
              <th className={cn(TH, "text-center")}>Kursus</th>
              <th className={cn(TH, "text-center")}>Voucher</th>
              <th className={TH}>Dibuat</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.name}
                  </p>
                </td>
                <td className="max-w-80 px-4 py-3">
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {r.description ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">
                  <CountChip value={r.courseCount} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CountChip value={r.voucherCount} />
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {formatDate(r.createdAt)}
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
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <FolderTree className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                {r.name}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {r.courseCount} kursus · {r.voucherCount} voucher
              </p>
            </div>
            <RowActions row={r} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CountChip({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
        value > 0
          ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]"
          : "bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500",
      )}
    >
      {value}
    </span>
  );
}

function RowActions({
  row,
  onEdit,
}: {
  row: AdminCategoryRow;
  onEdit: (row: AdminCategoryRow) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteCategoryMutation();

  const openConfirm = () => {
    setError(null);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    setError(null);
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success("Kategori dihapus.");
        setConfirmOpen(false);
      },
      onError: (err) =>
        setError(err instanceof Error ? err.message : "Gagal menghapus kategori."),
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
        onClick={openConfirm}
        aria-label={`Hapus ${row.name}`}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 dark:text-red-300 dark:ring-red-500/30 dark:hover:bg-red-500/10"
      >
        <Trash2 className="size-3.5" strokeWidth={2.4} />
        Hapus
      </button>

      <DeleteCategoryDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setError(null);
        }}
        category={row}
        deleting={deleteMutation.isPending}
        error={error}
        onConfirm={handleDelete}
      />
    </div>
  );
}
