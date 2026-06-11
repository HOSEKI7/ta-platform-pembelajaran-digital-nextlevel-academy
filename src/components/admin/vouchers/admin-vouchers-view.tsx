"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/use-debounced-value";
import { Inbox, Loader2, Plus, Search, Ticket } from "lucide-react";

import {
  type AdminVouchersParams,
  type SortOption,
  type StatusFilter,
  parsePage,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-vouchers-query";
import { useAdminVouchersQuery } from "@/hooks/use-admin-vouchers";

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

import { VouchersTable } from "./vouchers-table";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Semua Status",
  scheduled: "Terjadwal",
  active: "Aktif",
  inactive: "Nonaktif",
  expired: "Kedaluwarsa",
  exhausted: "Habis",
};

const SORT_LABELS: Record<SortOption, string> = {
  valid_desc: "Berlaku terlama",
  valid_asc: "Berlaku terdekat",
  usage_desc: "Pemakaian terbanyak",
  usage_asc: "Pemakaian tersedikit",
};

export function AdminVouchersView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePage(searchParams.get("page"));
  const urlStatus = parseStatus(searchParams.get("status"));
  const urlSort = parseSort(searchParams.get("sort"));
  const urlSearch = parseSearch(searchParams.get("search"));

  const [searchInput, setSearchInput] = useState(urlSearch);

  const params: AdminVouchersParams = useMemo(
    () => ({
      page: urlPage,
      status: urlStatus,
      sort: urlSort,
      search: urlSearch,
    }),
    [urlPage, urlStatus, urlSort, urlSearch],
  );

  const vouchersQuery = useAdminVouchersQuery(params);

  const updateUrl = useCallback(
    (
      next: Partial<{
        page: number;
        status: StatusFilter;
        sort: SortOption;
        search: string;
      }>,
    ) => {
      const sp = new URLSearchParams(searchParams.toString());

      if ("search" in next) {
        const trimmed = (next.search ?? "").trim();
        if (trimmed.length > 0) sp.set("search", trimmed);
        else sp.delete("search");
      }
      if ("status" in next) {
        if (next.status && next.status !== "all") sp.set("status", next.status);
        else sp.delete("status");
      }
      if ("sort" in next) {
        if (next.sort && next.sort !== "valid_desc") sp.set("sort", next.sort);
        else sp.delete("sort");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else if ("status" in next || "sort" in next || "search" in next) {
        sp.delete("page");
      }

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Debounced search → URL.
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    updateUrl({ search: debouncedSearch });
  }, [debouncedSearch, urlSearch, updateUrl]);

  const data = vouchersQuery.data;
  const isFetching = vouchersQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 10;
  const rangeStart = total === 0 ? 0 : (urlPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(urlPage * pageSize, total);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Admin · Manajemen"
          title="Voucher"
          accent="Promo"
          description="Kelola voucher diskon promosi — buat kode persen atau potongan rupiah, atur kuota & masa berlaku, lalu nonaktifkan atau hapus saat tak lagi dipakai."
        />
        <Link
          href="/admin/vouchers/new"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-brand-700)]"
        >
          <Plus className="size-4" strokeWidth={2.6} />
          Buat Voucher
        </Link>
      </div>

      {/* Toolbar: search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => {
            setSearchInput("");
            updateUrl({ search: "" });
          }}
          placeholder="Cari kode voucher…"
          ariaLabel="Cari voucher"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={urlStatus}
            onValueChange={(value) => {
              if (typeof value === "string")
                updateUrl({ status: value as StatusFilter });
            }}
          >
            <SelectTrigger
              className="h-10 min-w-40 rounded-full"
              aria-label="Filter status"
            >
              <SelectValue>
                {(value: string) =>
                  STATUS_LABELS[value as StatusFilter] ?? "Semua Status"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
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
            <SelectTrigger
              className="h-10 min-w-44 rounded-full"
              aria-label="Urutkan"
            >
              <SelectValue>
                {(value: string) =>
                  SORT_LABELS[value as SortOption] ?? "Berlaku terlama"
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
        </div>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <Ticket className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Voucher
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
                    voucher
                  </>
                ) : (
                  "Tidak ada voucher untuk filter ini"
                )}
              </p>
            </div>
          </div>
          {isFetching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {vouchersQuery.isPending ? (
          <TableSkeleton />
        ) : vouchersQuery.isError ? (
          <ErrorState onRetry={() => vouchersQuery.refetch()} />
        ) : total === 0 ? (
          <EmptyState
            search={urlSearch}
            onReset={() => {
              setSearchInput("");
              updateUrl({ search: "", status: "all", sort: "valid_desc" });
            }}
          />
        ) : (
          <VouchersTable rows={data!.rows} isFetching={isFetching} />
        )}
      </section>

      {totalPages > 1 ? (
        <Pagination
          page={urlPage}
          totalPages={totalPages}
          onChange={(p) => updateUrl({ page: p })}
          ariaLabel="Paginasi daftar voucher"
        />
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3.5 w-20 shrink-0 rounded bg-zinc-100 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-zinc-100 dark:bg-white/5" />
            <div className="h-3 w-1/5 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
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
        Gagal memuat daftar voucher
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
          ? `Tidak ada voucher dengan kode “${search}”`
          : "Belum ada voucher untuk filter ini"}
      </p>
      <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
        Coba ubah kata kunci atau filter status — atau buat voucher baru.
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
