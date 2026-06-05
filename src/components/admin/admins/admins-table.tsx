"use client";

import { Power, PowerOff, Trash2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminAccountRow } from "@/lib/admin-accounts-loader";

type Props = {
  admins: AdminAccountRow[];
  currentAdminId: string;
  isFetching: boolean;
  onToggleStatus: (admin: AdminAccountRow) => void;
  onDelete: (admin: AdminAccountRow) => void;
};

const WIB_TZ = "Asia/Jakarta";

function fmtDate(iso: string): string {
  return formatInTimeZone(new Date(iso), WIB_TZ, "dd/MM/yyyy");
}

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

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
          : "bg-zinc-100 text-zinc-500 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-zinc-400",
        )}
      />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function PersonCell({
  admin,
  isSelf,
}: {
  admin: AdminAccountRow;
  isSelf: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {admin.image ? <AvatarImage src={admin.image} alt={admin.name} /> : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(admin.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="truncate">{admin.name}</span>
          {isSelf ? (
            <span className="shrink-0 rounded-full bg-[color:var(--color-brand-50)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              Anda
            </span>
          ) : null}
        </p>
        <p className="truncate text-[12px] text-zinc-400 dark:text-zinc-500">
          {admin.email}
        </p>
      </div>
    </div>
  );
}

function RowActions({
  admin,
  isSelf,
  onToggleStatus,
  onDelete,
}: {
  admin: AdminAccountRow;
  isSelf: boolean;
  onToggleStatus: (admin: AdminAccountRow) => void;
  onDelete: (admin: AdminAccountRow) => void;
}) {
  if (isSelf) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-[11px] italic text-zinc-400 dark:text-zinc-500">
          Akun sendiri
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onToggleStatus(admin)}
        aria-label={admin.isActive ? `Nonaktifkan ${admin.name}` : `Aktifkan ${admin.name}`}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full ring-1 transition",
          admin.isActive
            ? "text-zinc-500 ring-zinc-200 hover:bg-amber-50 hover:text-amber-600 hover:ring-amber-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-amber-500/15 dark:hover:text-amber-400 dark:hover:ring-amber-500/30"
            : "text-zinc-500 ring-zinc-200 hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400 dark:hover:ring-emerald-500/30",
        )}
      >
        {admin.isActive ? (
          <PowerOff className="size-4" strokeWidth={2.2} />
        ) : (
          <Power className="size-4" strokeWidth={2.2} />
        )}
      </button>
      <button
        type="button"
        onClick={() => onDelete(admin)}
        aria-label={`Hapus ${admin.name}`}
        className="inline-flex size-9 items-center justify-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:hover:ring-red-500/30"
      >
        <Trash2 className="size-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function AdminsTable({
  admins,
  currentAdminId,
  isFetching,
  onToggleStatus,
  onDelete,
}: Props) {
  return (
    <div className={cn("transition-opacity", isFetching && "pointer-events-none opacity-60")}>
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-[color:var(--color-surface-border)]">
              <th className={cn(TH, "w-12 text-center")}>#</th>
              <th className={TH}>Administrator</th>
              <th className={TH}>Bergabung</th>
              <th className={TH}>Status</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a, i) => {
              const isSelf = a.id === currentAdminId;
              return (
                <tr
                  key={a.id}
                  className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-white/[0.04] dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <PersonCell admin={a} isSelf={isSelf} />
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    {fmtDate(a.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={a.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      admin={a}
                      isSelf={isSelf}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
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
        {admins.map((a) => {
          const isSelf = a.id === currentAdminId;
          return (
            <li key={a.id} className="flex flex-col gap-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <PersonCell admin={a} isSelf={isSelf} />
                <StatusBadge isActive={a.isActive} />
              </div>
              <div className="flex items-center justify-between pl-[3.25rem]">
                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmtDate(a.createdAt)}
                </span>
                <RowActions
                  admin={a}
                  isSelf={isSelf}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
