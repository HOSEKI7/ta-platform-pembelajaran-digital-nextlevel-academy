"use client";

import { useMemo, useState } from "react";
import { CalendarOff, CalendarX2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  classifyHolidayState,
  HOLIDAY_STATE_LABEL,
  type HolidayRow,
  type HolidayState,
} from "@/lib/admin-internship-holiday-query";
import { cn } from "@/lib/utils";
import { useDeleteHolidayMutation } from "@/hooks/use-admin-internship-holiday-actions";

import { DeleteConfigDialog } from "@/components/admin/internship/config/delete-config-dialog";
import { formatDMY } from "./date-utils";

type Props = {
  rows: HolidayRow[];
  todayISO: string;
  isFetching: boolean;
  onEdit: (row: HolidayRow) => void;
  onEndEarly: (row: HolidayRow) => void;
};

const STATE_BADGE: Record<HolidayState, string> = {
  UPCOMING:
    "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
  ACTIVE:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  PAST: "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10",
};

function StateBadge({ state }: { state: HolidayState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1",
        STATE_BADGE[state],
      )}
    >
      {HOLIDAY_STATE_LABEL[state]}
    </span>
  );
}

const TH = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-400";

export function HolidaysTable({ rows, todayISO, isFetching, onEdit, onEndEarly }: Props) {
  // Newest-starting first; the loader already orders this way but keep it stable.
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [rows],
  );

  return (
    <div className={cn("transition-opacity", isFetching && "pointer-events-none opacity-60")}>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={TH}>Keterangan</th>
              <th className={TH}>Periode</th>
              <th className={cn(TH, "text-center")}>Durasi</th>
              <th className={cn(TH, "text-center")}>Status</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const state = classifyHolidayState(r.startDate, r.endDate, todayISO);
              return (
                <tr
                  key={r.id}
                  className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                >
                  <td className="max-w-96 px-4 py-3">
                    <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                    {formatDMY(r.startDate)} – {formatDMY(r.endDate)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                    {r.days} hari
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StateBadge state={state} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      row={r}
                      state={state}
                      onEdit={onEdit}
                      onEndEarly={onEndEarly}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {sorted.map((r) => {
          const state = classifyHolidayState(r.startDate, r.endDate, todayISO);
          return (
            <li key={r.id} className="flex items-center gap-3 px-4 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
                <CalendarOff className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.description}
                  </p>
                  <StateBadge state={state} />
                </div>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDMY(r.startDate)} – {formatDMY(r.endDate)} · {r.days} hari
                </p>
              </div>
              <RowActions
                row={r}
                state={state}
                onEdit={onEdit}
                onEndEarly={onEndEarly}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RowActions({
  row,
  state,
  onEdit,
  onEndEarly,
}: {
  row: HolidayRow;
  state: HolidayState;
  onEdit: (row: HolidayRow) => void;
  onEndEarly: (row: HolidayRow) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteHolidayMutation();

  if (state === "PAST") {
    return <p className="text-right text-xs text-zinc-400">—</p>;
  }

  if (state === "ACTIVE") {
    return (
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => onEndEarly(row)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-50 dark:text-amber-300 dark:ring-amber-500/30 dark:hover:bg-amber-500/10"
        >
          <CalendarX2 className="size-3.5" strokeWidth={2.4} />
          Akhiri Lebih Awal
        </button>
      </div>
    );
  }

  // UPCOMING → full edit + delete.
  const handleDelete = () => {
    setError(null);
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success("Tanggal libur dihapus.");
        setConfirmOpen(false);
      },
      onError: (err) =>
        setError(err instanceof Error ? err.message : "Gagal menghapus libur."),
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(row)}
        aria-label={`Edit ${row.description}`}
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
        aria-label={`Hapus ${row.description}`}
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
        entityLabel="libur"
        itemName={row.description}
        blocked={false}
        deleting={deleteMutation.isPending}
        error={error}
        onConfirm={handleDelete}
      />
    </div>
  );
}
