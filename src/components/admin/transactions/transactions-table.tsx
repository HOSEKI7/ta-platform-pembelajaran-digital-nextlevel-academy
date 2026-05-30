"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminTransactionRow } from "@/lib/admin-transactions-query";

import { StatusBadge } from "@/components/dashboard/transactions/transaction-status";

type Props = {
  rows: AdminTransactionRow[];
  isFetching: boolean;
};

const WIB_TZ = "Asia/Jakarta";

function fmtDate(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy");
}

function fmtTime(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "HH.mm");
}

/** Short, recognisable order reference (last 8 chars). Full id in the title. */
function shortId(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

/** Stagger delay so rows cascade in on load (CSS-only via tw-animate-css). */
function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 45}ms`;
}

function DetailLink({ id, title }: { id: string; title: string }) {
  return (
    <Link
      href={`/admin/transactions/${id}`}
      aria-label={`Detail transaksi ${title}`}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] transition hover:bg-[color:var(--color-brand-50)] dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30 dark:hover:bg-[color:var(--color-brand-500)]/10"
    >
      Detail
      <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
    </Link>
  );
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function TransactionsTable({ rows, isFetching }: Props) {
  return (
    <div
      className={cn(
        "transition-opacity",
        isFetching && "pointer-events-none opacity-60",
      )}
    >
      {/* Desktop: semantic table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={cn(TH, "w-12 text-center")}>#</th>
              <th className={TH}>ID</th>
              <th className={TH}>Tanggal</th>
              <th className={TH}>Pengguna</th>
              <th className={TH}>Kursus</th>
              <th className={cn(TH, "text-right")}>Jumlah</th>
              <th className={TH}>Status</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                style={{ animationDelay: rowDelay(i) }}
                className={cn(
                  "border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80",
                  "dark:border-white/[0.04] dark:hover:bg-white/[0.03]",
                  "fade-in-0 slide-in-from-bottom-1 fill-mode-both animate-in duration-500",
                )}
              >
                <td className="px-4 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-3">
                  <span
                    title={r.id}
                    className="font-mono text-[13px] font-semibold text-zinc-700 dark:text-zinc-200"
                  >
                    {shortId(r.id)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                    {fmtDate(r.createdAt)}
                  </p>
                  <p className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    {fmtTime(r.createdAt)} WIB
                  </p>
                </td>
                <td className="max-w-48 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.userName}
                  </p>
                  <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                    {r.userEmail}
                  </p>
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">
                    {r.courseTitle}
                  </p>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {idr.format(r.finalPrice)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <DetailLink id={r.id} title={r.courseTitle} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet: stacked cards */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {rows.map((r, i) => (
          <li
            key={r.id}
            style={{ animationDelay: rowDelay(i) }}
            className="fade-in-0 slide-in-from-bottom-1 fill-mode-both flex animate-in flex-col gap-3 px-4 py-4 duration-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {r.userName}
                </p>
                <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                  {r.userEmail}
                </p>
              </div>
              <StatusBadge status={r.status} className="shrink-0" />
            </div>
            <p className="line-clamp-1 text-sm text-zinc-600 dark:text-zinc-300">
              {r.courseTitle}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span
                title={r.id}
                className="font-mono font-semibold text-zinc-600 dark:text-zinc-300"
              >
                {shortId(r.id)}
              </span>
              <span className="tabular-nums">
                {fmtDate(r.createdAt)} · {fmtTime(r.createdAt)} WIB
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {idr.format(r.finalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <DetailLink id={r.id} title={r.courseTitle} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
