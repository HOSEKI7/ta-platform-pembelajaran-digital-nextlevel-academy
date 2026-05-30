"use client";

import { formatInTimeZone } from "date-fns-tz";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminCertificateRow } from "@/lib/admin-certificates-query";

import { CertificateStatusBadge } from "./certificate-status-badge";
import { CertificateRowActions } from "./certificate-row-actions";

type Props = {
  rows: AdminCertificateRow[];
  isFetching: boolean;
};

const WIB_TZ = "Asia/Jakarta";

function fmtDate(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy");
}

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

function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 45}ms`;
}

function PersonCell({ row }: { row: AdminCertificateRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {row.recipientImage ? (
          <AvatarImage src={row.recipientImage} alt={row.recipientName} />
        ) : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(row.recipientName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
          {row.recipientName}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {row.recipientEmail}
        </p>
      </div>
    </div>
  );
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function CertificatesTable({ rows, isFetching }: Props) {
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
              <th className={TH}>Penerima</th>
              <th className={TH}>Kursus</th>
              <th className={TH}>Tanggal Terbit</th>
              <th className={TH}>Nomor Sertifikat</th>
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
                <td className="max-w-64 px-4 py-3">
                  <PersonCell row={r} />
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="truncate text-sm text-zinc-700 dark:text-zinc-200">
                    {r.courseTitle}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                  {fmtDate(r.issuedAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    title={r.certificateNo}
                    className="font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {r.certificateNo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <CertificateStatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <CertificateRowActions
                    certificateId={r.id}
                    certificateNo={r.certificateNo}
                  />
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
              <PersonCell row={r} />
              <CertificateStatusBadge status={r.status} className="shrink-0" />
            </div>
            <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="truncate font-medium text-zinc-700 dark:text-zinc-200">
                {r.courseTitle}
              </span>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {r.certificateNo}
              </span>
              <span className="tabular-nums">Terbit {fmtDate(r.issuedAt)}</span>
            </div>
            <div className="flex items-center justify-end">
              <CertificateRowActions
                certificateId={r.id}
                certificateNo={r.certificateNo}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
