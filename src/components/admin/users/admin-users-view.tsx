"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, Loader2, Plus, Search, UsersRound } from "lucide-react";
import { toast } from "sonner";

import {
  type AdminUserRow,
  type AdminUsersParams,
  type RoleFilter,
  type SortOption,
  type StatusFilter,
  ROLE_LABELS,
  parsePage,
  parseRole,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-users-query";
import { useAdminUsersQuery } from "@/hooks/use-admin-users";
import {
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} from "@/hooks/use-admin-user-actions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Pagination } from "@/components/dashboard/shared/pagination";
import { SearchBox } from "@/components/dashboard/shared/search-box";

import { UsersTable } from "./users-table";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ToggleStatusDialog } from "./toggle-status-dialog";

const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  all: "Semua Role",
  PESERTA_DIDIK: ROLE_LABELS.PESERTA_DIDIK,
  PESERTA_MAGANG: ROLE_LABELS.PESERTA_MAGANG,
  MENTOR: ROLE_LABELS.MENTOR,
};

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "Semua Status",
  active: "Aktif",
  inactive: "Nonaktif",
};

const SORT_LABELS: Record<SortOption, string> = {
  created_desc: "Terbaru",
  created_asc: "Terlama",
};

export function AdminUsersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePage(searchParams.get("page"));
  const urlRole = parseRole(searchParams.get("role"));
  const urlStatus = parseStatus(searchParams.get("status"));
  const urlSearch = parseSearch(searchParams.get("search"));
  const urlSort = parseSort(searchParams.get("sort"));

  const [searchInput, setSearchInput] = useState(urlSearch);

  const params: AdminUsersParams = useMemo(
    () => ({
      page: urlPage,
      role: urlRole,
      status: urlStatus,
      search: urlSearch,
      sort: urlSort,
    }),
    [urlPage, urlRole, urlStatus, urlSearch, urlSort],
  );

  const usersQuery = useAdminUsersQuery(params);
  const deleteMutation = useDeleteUserMutation();
  const toggleMutation = useToggleUserStatusMutation();

  const [userToDelete, setUserToDelete] = useState<AdminUserRow | null>(null);
  const [userToToggle, setUserToToggle] = useState<AdminUserRow | null>(null);

  const updateUrl = useCallback(
    (
      next: Partial<{
        page: number;
        role: RoleFilter;
        status: StatusFilter;
        search: string;
        sort: SortOption;
      }>,
    ) => {
      const sp = new URLSearchParams(searchParams.toString());

      if ("search" in next) {
        const trimmed = (next.search ?? "").trim();
        if (trimmed.length > 0) sp.set("search", trimmed);
        else sp.delete("search");
      }
      if ("role" in next) {
        if (next.role && next.role !== "all") sp.set("role", next.role);
        else sp.delete("role");
      }
      if ("status" in next) {
        if (next.status && next.status !== "all") sp.set("status", next.status);
        else sp.delete("status");
      }
      if ("sort" in next) {
        if (next.sort && next.sort !== "created_desc") sp.set("sort", next.sort);
        else sp.delete("sort");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else if (
        "role" in next ||
        "status" in next ||
        "search" in next ||
        "sort" in next
      ) {
        sp.delete("page");
      }

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Debounced search → URL.
  useEffect(() => {
    if (searchInput === urlSearch) return;
    const handle = setTimeout(() => updateUrl({ search: searchInput }), 250);
    return () => clearTimeout(handle);
  }, [searchInput, urlSearch, updateUrl]);

  const data = usersQuery.data;
  const isFetching = usersQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 10;
  const rangeStart = total === 0 ? 0 : (urlPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(urlPage * pageSize, total);

  const handleConfirmDelete = useCallback(() => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`Pengguna “${userToDelete.name}” dihapus.`);
        setUserToDelete(null);
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal menghapus pengguna.",
        ),
    });
  }, [userToDelete, deleteMutation]);

  const handleConfirmToggle = useCallback(() => {
    if (!userToToggle) return;
    const nextActive = !userToToggle.isActive;
    toggleMutation.mutate(
      { userId: userToToggle.id, isActive: nextActive },
      {
        onSuccess: () => {
          toast.success(
            nextActive
              ? `Akun “${userToToggle.name}” diaktifkan.`
              : `Akun “${userToToggle.name}” dinonaktifkan.`,
          );
          setUserToToggle(null);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal mengubah status akun.",
          ),
      },
    );
  }, [userToToggle, toggleMutation]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Manajemen"
        title="Kelola"
        accent="Pengguna"
        description="Kelola seluruh akun platform — buat, sunting, nonaktifkan, atau hapus."
      />

      {/* Toolbar: search + filters + create CTA */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => {
            setSearchInput("");
            updateUrl({ search: "" });
          }}
          placeholder="Cari nama atau email…"
          ariaLabel="Cari pengguna"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={urlRole}
            onValueChange={(value) => {
              if (typeof value === "string")
                updateUrl({ role: value as RoleFilter });
            }}
          >
            <SelectTrigger className="h-10 min-w-40 rounded-full" aria-label="Filter role">
              <SelectValue>
                {(value: string) =>
                  ROLE_FILTER_LABELS[value as RoleFilter] ?? "Semua Role"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_FILTER_LABELS) as RoleFilter[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_FILTER_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={urlStatus}
            onValueChange={(value) => {
              if (typeof value === "string")
                updateUrl({ status: value as StatusFilter });
            }}
          >
            <SelectTrigger className="h-10 min-w-36 rounded-full" aria-label="Filter status">
              <SelectValue>
                {(value: string) =>
                  STATUS_FILTER_LABELS[value as StatusFilter] ?? "Semua Status"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_FILTER_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={urlSort}
            onValueChange={(value) => {
              if (typeof value === "string")
                updateUrl({ sort: value as SortOption });
            }}
          >
            <SelectTrigger className="h-10 min-w-36 rounded-full" aria-label="Urutkan tanggal daftar">
              <SelectValue>
                {(value: string) =>
                  `Daftar: ${SORT_LABELS[value as SortOption] ?? "Terbaru"}`
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link
            href="/admin/users/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
          >
            <Plus className="size-4" strokeWidth={2.6} />
            Tambah Pengguna
          </Link>
        </div>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <UsersRound className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Pengguna
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {total > 0 ? (
                  <>
                    Menampilkan{" "}
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                      {rangeStart}–{rangeEnd}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                      {total}
                    </span>{" "}
                    pengguna
                  </>
                ) : (
                  "Tidak ada pengguna untuk filter ini"
                )}
              </p>
            </div>
          </div>
          {isFetching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {usersQuery.isPending ? (
          <TableSkeleton />
        ) : usersQuery.isError ? (
          <ErrorState onRetry={() => usersQuery.refetch()} />
        ) : total === 0 ? (
          <EmptyState
            search={urlSearch}
            onReset={() => {
              setSearchInput("");
              updateUrl({ search: "", role: "all", status: "all" });
            }}
          />
        ) : (
          <UsersTable
            users={data!.users}
            isFetching={isFetching}
            onToggleStatus={setUserToToggle}
            onDelete={setUserToDelete}
          />
        )}
      </section>

      {totalPages > 1 ? (
        <Pagination
          page={urlPage}
          totalPages={totalPages}
          onChange={(p) => updateUrl({ page: p })}
          ariaLabel="Paginasi daftar pengguna"
        />
      ) : null}

      <DeleteUserDialog
        open={userToDelete !== null}
        onOpenChange={(o) => {
          if (!o && !deleteMutation.isPending) setUserToDelete(null);
        }}
        userName={userToDelete?.name ?? ""}
        deleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />

      <ToggleStatusDialog
        open={userToToggle !== null}
        onOpenChange={(o) => {
          if (!o && !toggleMutation.isPending) setUserToToggle(null);
        }}
        userName={userToToggle?.name ?? ""}
        isActive={userToToggle?.isActive ?? true}
        saving={toggleMutation.isPending}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-10 shrink-0 rounded-full bg-zinc-100 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-zinc-100 dark:bg-white/5" />
            <div className="h-3 w-1/4 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
          </div>
          <div className="h-6 w-20 rounded-full bg-zinc-100 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-6" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Gagal memuat daftar pengguna
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}

function EmptyState({
  search,
  onReset,
}: {
  search: string;
  onReset: () => void;
}) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        <Search className="size-5" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {search.length > 0
          ? `Tidak ada pengguna dengan kata “${search}”`
          : "Belum ada pengguna untuk filter ini"}
      </p>
      <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
        Coba ubah kata kunci, role, atau status — atau setel ulang filter.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 items-center rounded-full bg-zinc-900 px-4 text-[12px] font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        Reset filter
      </button>
    </div>
  );
}
