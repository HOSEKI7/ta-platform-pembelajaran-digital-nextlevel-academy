"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { AdminBadgeRow } from "@/lib/admin-badges-query";
import { TRIGGER_LABELS } from "@/lib/admin-badges-query";
import { cn } from "@/lib/utils";
import { useDeleteBadgeMutation } from "@/hooks/use-admin-badge-actions";

import { ConfirmDialog } from "@/components/admin/courses/form/confirm-dialog";

import { BadgeIcon } from "./badge-icon";

type Props = {
  rows: AdminBadgeRow[];
  isFetching: boolean;
  onEdit: (row: AdminBadgeRow) => void;
};

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

function targetLabel(row: AdminBadgeRow): string {
  switch (row.trigger) {
    case "LEVEL_REACHED":
      return `Level ${row.threshold}`;
    case "COURSES_COMPLETED":
      return `${row.threshold} kursus`;
    case "COURSE_SPECIFIC":
      return row.courseTitle ?? "—";
  }
}

export function BadgesTable({ rows, isFetching, onEdit }: Props) {
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
              <th className={cn(TH, "w-16")}>Ikon</th>
              <th className={TH}>Nama</th>
              <th className={TH}>Trigger</th>
              <th className={TH}>Target</th>
              <th className={TH}>EXP</th>
              <th className={TH}>Diperoleh</th>
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
                  <BadgeIcon
                    logoUrl={r.logoUrl}
                    trigger={r.trigger}
                    threshold={r.threshold}
                    size="sm"
                    alt={r.name}
                  />
                </td>
                <td className="max-w-72 px-4 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {r.howToEarn}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200">
                  {TRIGGER_LABELS[r.trigger]}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200">
                  {targetLabel(r)}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {r.expMinimum}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {r.earnedCount}
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
            <BadgeIcon
              logoUrl={r.logoUrl}
              trigger={r.trigger}
              threshold={r.threshold}
              size="sm"
              alt={r.name}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                {r.name}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {TRIGGER_LABELS[r.trigger]} · {targetLabel(r)} · {r.earnedCount}{" "}
                diperoleh
              </p>
            </div>
            <RowActions row={r} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RowActions({
  row,
  onEdit,
}: {
  row: AdminBadgeRow;
  onEdit: (row: AdminBadgeRow) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteBadgeMutation();

  const handleDelete = () => {
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success("Badge dihapus.");
        setConfirmOpen(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Gagal menghapus badge."),
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
        onClick={() => setConfirmOpen(true)}
        aria-label={`Hapus ${row.name}`}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 dark:text-red-300 dark:ring-red-500/30 dark:hover:bg-red-500/10"
      >
        <Trash2 className="size-3.5" strokeWidth={2.4} />
        Hapus
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus badge "${row.name}"?`}
        description={
          row.earnedCount > 0
            ? `Badge ini sudah diperoleh ${row.earnedCount} pengguna. Riwayat mereka tetap tersimpan, tetapi badge tidak bisa diperoleh lagi. Tindakan ini tidak dapat dibatalkan.`
            : "Tindakan ini tidak dapat dibatalkan."
        }
        confirmLabel="Hapus"
        busy={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
