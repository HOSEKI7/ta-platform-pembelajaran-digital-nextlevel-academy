"use client";

import { Receipt } from "lucide-react";

import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  OrderStatus,
  RecentTransaction,
} from "@/lib/admin-dashboard-mock";

import { ChartCard } from "./chart-card";

const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  SUCCESS: {
    label: "Sukses",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  FAILED: {
    label: "Gagal",
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    className:
      "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-[color:var(--color-surface-border)]",
  },
};

/** Relative WIB label computed against a fixed `nowISO` so SSR/CSR match. */
function relativeTime(fromISO: string, nowISO: string): string {
  const diffMin = Math.round(
    (new Date(nowISO).getTime() - new Date(fromISO).getTime()) / 60_000,
  );
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

type Props = {
  transactions: RecentTransaction[];
  nowISO: string;
};

export function RecentTransactionsCard({ transactions, nowISO }: Props) {
  return (
    <ChartCard
      title="Transaksi Terbaru"
      subtitle="Order terakhir masuk"
      icon={Receipt}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              <th className="pb-2 pr-3 font-semibold">Pengguna</th>
              <th className="hidden pb-2 pr-3 font-semibold sm:table-cell">Kursus</th>
              <th className="pb-2 pr-3 text-right font-semibold">Jumlah</th>
              <th className="pb-2 pr-3 font-semibold">Status</th>
              <th className="hidden pb-2 text-right font-semibold md:table-cell">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const meta = STATUS_META[tx.status];
              return (
                <tr
                  key={tx.id}
                  className="border-t border-zinc-100 dark:border-[color:var(--color-surface-border)]"
                >
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-zinc-800 dark:text-zinc-100">
                      {tx.user}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {tx.id}
                    </p>
                  </td>
                  <td className="hidden max-w-[14rem] truncate py-2.5 pr-3 text-zinc-600 dark:text-zinc-300 sm:table-cell">
                    {tx.course}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {idr.format(tx.amount)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                        meta.className,
                      )}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="hidden py-2.5 text-right text-[11px] text-zinc-400 dark:text-zinc-500 md:table-cell">
                    {relativeTime(tx.createdAtISO, nowISO)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
