"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from "@/hooks/use-debounced-value";
import { FolderTree, Inbox, Loader2, Plus, Search } from "lucide-react";

import {
  type AdminCategoryRow,
  type AdminCategoriesParams,
  type CategorySort,
  SORT_OPTIONS,
  SORT_LABELS,
  parsePage,
  parseSearch,
  parseSort,
} from "@/lib/admin-categories-query";
import { useAdminCategoriesQuery } from "@/hooks/use-admin-categories";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/dashboard/shared/pagination";
import { SearchBox } from "@/components/dashboard/shared/search-box";

import { CategoriesTable } from "./categories-table";
import { CategoryFormDialog } from "./category-form-dialog";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; row: AdminCategoryRow }
  | null;

export function AdminCategoriesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePage(searchParams.get("page"));
  const urlSort = parseSort(searchParams.get("sort"));
  const urlSearch = parseSearch(searchParams.get("search"));

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogNonce, setDialogNonce] = useState(0);

  const params: AdminCategoriesParams = useMemo(
    () => ({ page: urlPage, sort: urlSort, search: urlSearch }),
    [urlPage, urlSort, urlSearch],
  );

  const categoriesQuery = useAdminCategoriesQuery(params);

  const updateUrl = useCallback(
    (next: Partial<{ page: number; sort: CategorySort; search: string }>) => {
      const sp = new URLSearchParams(searchParams.toString());
      if ("search" in next) {
        const trimmed = (next.search ?? "").trim();
        if (trimmed.length > 0) sp.set("search", trimmed);
        else sp.delete("search");
      }
      if ("sort" in next) {
        if (next.sort && next.sort !== "name_asc") sp.set("sort", next.sort);
        else sp.delete("sort");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else if ("sort" in next || "search" in next) {
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

  const openCreate = () => {
    setDialogNonce((n) => n + 1);
    setDialog({ mode: "create" });
  };
  const openEdit = (row: AdminCategoryRow) => {
    setDialogNonce((n) => n + 1);
    setDialog({ mode: "edit", row });
  };

  const data = categoriesQuery.data;
  const isFetching = categoriesQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Kategori Course
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelompok untuk mengorganisasi kursus di katalog.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-brand-700)]"
        >
          <Plus className="size-4" strokeWidth={2.6} />
          Tambah Kategori
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => {
            setSearchInput("");
            updateUrl({ search: "" });
          }}
          placeholder="Cari nama kategori…"
          ariaLabel="Cari kategori"
        />
        <Select
          value={urlSort}
          onValueChange={(value) => {
            if (typeof value === "string")
              updateUrl({ sort: value as CategorySort });
          }}
        >
          <SelectTrigger className="h-10 min-w-48 rounded-full" aria-label="Urutkan">
            <SelectValue>
              {(value: string | null | undefined) =>
                SORT_LABELS[value as CategorySort] ?? SORT_LABELS.name_asc
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {SORT_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <FolderTree className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Kategori
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {total > 0
                  ? `${total} kategori`
                  : "Tidak ada kategori untuk filter ini"}
              </p>
            </div>
          </div>
          {isFetching ? (
            <Loader2 className="size-4 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {categoriesQuery.isPending ? (
          <TableSkeleton />
        ) : categoriesQuery.isError ? (
          <ErrorState onRetry={() => categoriesQuery.refetch()} />
        ) : total === 0 ? (
          <EmptyState search={urlSearch} onCreate={openCreate} />
        ) : (
          <CategoriesTable
            rows={data!.rows}
            isFetching={isFetching}
            onEdit={openEdit}
          />
        )}
      </section>

      {totalPages > 1 ? (
        <Pagination
          page={urlPage}
          totalPages={totalPages}
          onChange={(p) => updateUrl({ page: p })}
          ariaLabel="Paginasi daftar kategori"
        />
      ) : null}

      {dialog ? (
        <CategoryFormDialog
          key={dialogNonce}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={dialog.mode}
          initial={dialog.mode === "edit" ? dialog.row : undefined}
          onSubmitted={() => categoriesQuery.refetch()}
        />
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3.5 w-1/4 rounded bg-zinc-100 dark:bg-white/5" />
          <div className="h-3 flex-1 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
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
        Gagal memuat daftar kategori
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
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        <Search className="size-5" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {search.length > 0
          ? `Tidak ada kategori dengan nama “${search}”`
          : "Belum ada kategori"}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[12px] font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        Tambah Kategori
      </button>
    </div>
  );
}
