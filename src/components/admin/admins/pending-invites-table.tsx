"use client";

import { Mail, X } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { cn } from "@/lib/utils";
import type { PendingInviteRow } from "@/lib/admin-accounts-loader";

type Props = {
  invites: PendingInviteRow[];
  isFetching: boolean;
  onRevoke: (invite: PendingInviteRow) => void;
};

const WIB_TZ = "Asia/Jakarta";

function fmtDateTime(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy HH:mm");
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function PendingInvitesTable({ invites, isFetching, onRevoke }: Props) {
  return (
    <div className={cn("transition-opacity", isFetching && "pointer-events-none opacity-60")}>
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={TH}>Email</th>
              <th className={TH}>Diundang oleh</th>
              <th className={TH}>Kedaluwarsa</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30">
                      <Mail className="size-4" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                        {inv.email}
                      </p>
                      {inv.name ? (
                        <p className="truncate text-[12px] text-zinc-400 dark:text-zinc-500">
                          {inv.name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {inv.invitedByName}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmtDateTime(inv.expiresAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onRevoke(inv)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:hover:ring-red-500/30"
                    >
                      <X className="size-3.5" strokeWidth={2.6} />
                      Batalkan
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {invites.map((inv) => (
          <li key={inv.id} className="flex flex-col gap-2 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                  {inv.email}
                </p>
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                  Oleh {inv.invitedByName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRevoke(inv)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)]"
              >
                <X className="size-3.5" strokeWidth={2.6} />
                Batalkan
              </button>
            </div>
            <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              Kedaluwarsa {fmtDateTime(inv.expiresAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
