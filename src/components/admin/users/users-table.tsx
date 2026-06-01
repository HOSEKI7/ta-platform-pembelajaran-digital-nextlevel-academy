"use client";

import Link from "next/link";
import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUserRow } from "@/lib/admin-users-query";

import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";

type Props = {
  users: AdminUserRow[];
  isFetching: boolean;
  onToggleStatus: (user: AdminUserRow) => void;
  onDelete: (user: AdminUserRow) => void;
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

function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 45}ms`;
}

/** Avatar + name + email cell, shared between desktop table and mobile card. */
function PersonCell({ user }: { user: AdminUserRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
          {user.name}
        </p>
        <p className="truncate text-[12px] text-zinc-400 dark:text-zinc-500">
          {user.email}
        </p>
      </div>
    </div>
  );
}

function RowActions({
  user,
  onToggleStatus,
  onDelete,
}: {
  user: AdminUserRow;
  onToggleStatus: (user: AdminUserRow) => void;
  onDelete: (user: AdminUserRow) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/users/${user.id}/edit`}
        aria-label={`Edit ${user.name}`}
        className="inline-flex size-9 items-center justify-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] hover:ring-[color:var(--color-brand-200)] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-brand-500)]/10 dark:hover:text-[color:var(--color-brand-200)]"
      >
        <Pencil className="size-4" strokeWidth={2.2} />
      </Link>
      <button
        type="button"
        onClick={() => onToggleStatus(user)}
        aria-label={user.isActive ? `Nonaktifkan ${user.name}` : `Aktifkan ${user.name}`}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full ring-1 transition",
          user.isActive
            ? "text-zinc-500 ring-zinc-200 hover:bg-amber-50 hover:text-amber-600 hover:ring-amber-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-amber-500/15 dark:hover:text-amber-400 dark:hover:ring-amber-500/30"
            : "text-zinc-500 ring-zinc-200 hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-emerald-500/15 dark:hover:text-emerald-400 dark:hover:ring-emerald-500/30",
        )}
      >
        {user.isActive ? (
          <PowerOff className="size-4" strokeWidth={2.2} />
        ) : (
          <Power className="size-4" strokeWidth={2.2} />
        )}
      </button>
      <button
        type="button"
        onClick={() => onDelete(user)}
        aria-label={`Hapus ${user.name}`}
        className="inline-flex size-9 items-center justify-center rounded-full text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:hover:ring-red-500/30"
      >
        <Trash2 className="size-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

const TH =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500";

export function UsersTable({ users, isFetching, onToggleStatus, onDelete }: Props) {
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
              <th className={TH}>Pengguna</th>
              <th className={TH}>Role</th>
              <th className={TH}>Tgl Daftar</th>
              <th className={TH}>Status</th>
              <th className={cn(TH, "text-right")}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
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
                <td className="max-w-xs px-4 py-3">
                  <PersonCell user={u} />
                </td>
                <td className="px-4 py-3">
                  <UserRoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                  {fmtDate(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <UserStatusBadge isActive={u.isActive} />
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    user={u}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet: stacked cards */}
      <ul className="divide-y divide-zinc-50 lg:hidden dark:divide-white/[0.04]">
        {users.map((u, i) => (
          <li
            key={u.id}
            style={{ animationDelay: rowDelay(i) }}
            className="fade-in-0 slide-in-from-bottom-1 fill-mode-both flex animate-in flex-col gap-3 px-4 py-4 duration-500"
          >
            <div className="flex items-start justify-between gap-3">
              <PersonCell user={u} />
              <UserStatusBadge isActive={u.isActive} className="shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-[3.25rem] text-xs text-zinc-500 dark:text-zinc-400">
              <UserRoleBadge role={u.role} />
              <span className="tabular-nums">{fmtDate(u.createdAt)}</span>
            </div>
            <div className="flex items-center justify-end pl-[3.25rem]">
              <RowActions
                user={u}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
