"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { cn } from "@/lib/utils";
import { formatVoucherDiscount } from "@/lib/voucher-discount";
import type { AdminVoucherRow } from "@/lib/admin-vouchers-query";

import { VoucherStatusBadge } from "./voucher-status-badge";

type Props = {
  rows: AdminVoucherRow[];
  isFetching: boolean;
};

const WIB_TZ = "Asia/Jakarta";

function fmtDate(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy");
}

function shortId(id: string): string {
  return id.slice(-8).toUpperCase();
}

function usageLabel(used: number, max: number | null): string {
  return max == null ? `${used} / ∞` : `${used} / ${max}`;
}

function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 45}ms`;
}

function EditLink({ id, code }: { id: string; code: string }) {
  return (
    <Link
      href={`/admin/vouchers/${id}/edit`}
      aria-label={`Edit voucher ${code}`}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] transition hover:bg-[color:var(--color-brand-50)] dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30 dark:hover:bg-[color:var(--color-brand-500)]/10"
    >
      <Pencil className="size-3.5" strokeWidth={2.4} />
      Edit
    </Link>
  );
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function VouchersTable({ rows, isFetching }: Props) {
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
              <th className={TH}>Kode</th>
              <th className={TH}>Deskripsi</th>
              <th className={TH}>Diskon</th>
              <th className={TH}>Pemakaian</th>
              <th className={TH}>Berlaku s/d</th>
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
                    className="font-mono text-[13px] font-semibold text-zinc-500 dark:text-zinc-400"
                  >
                    {shortId(r.id)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                    {r.code}
                  </span>
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">
                    {r.description || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatVoucherDiscount(r)}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {usageLabel(r.usageCount, r.maxUsage)}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {fmtDate(r.endDate)}
                </td>
                <td className="px-4 py-3">
                  <VoucherStatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <EditLink id={r.id} code={r.code} />
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
                <p className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {r.code}
                </p>
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {r.description || "Tanpa deskripsi"}
                </p>
              </div>
              <VoucherStatusBadge status={r.status} className="shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatVoucherDiscount(r)}
              </span>
              <span className="tabular-nums">
                {usageLabel(r.usageCount, r.maxUsage)} pemakaian
              </span>
              <span className="tabular-nums">s/d {fmtDate(r.endDate)}</span>
            </div>
            <div className="flex items-center justify-end">
              <EditLink id={r.id} code={r.code} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
