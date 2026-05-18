"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import {
  type Sort,
  type StudentCatalogParams,
  parsePage,
  parseSearch,
  parseSort,
} from "@/lib/student-catalog-query";
import { useCategoriesQuery } from "@/hooks/use-categories";
import { useStudentCatalogQuery } from "@/hooks/use-student-catalog";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

import { InProgressGridSkeleton } from "../dashboard-skeletons";

import { CatalogCourseCard } from "./catalog-course-card";

const SORT_LABELS: Record<Sort, string> = {
  latest: "Terbaru",
  popular: "Terpopuler",
  "price-asc": "Harga: rendah → tinggi",
  "price-desc": "Harga: tinggi → rendah",
};

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePage(searchParams.get("page"));
  const urlCategory = searchParams.get("category");
  const urlSort = parseSort(searchParams.get("sort"));
  const urlSearch = parseSearch(searchParams.get("search"));

  const [searchInput, setSearchInput] = useState(urlSearch);

  const params: StudentCatalogParams = useMemo(
    () => ({
      page: urlPage,
      category: urlCategory ?? null,
      sort: urlSort,
      search: urlSearch,
    }),
    [urlPage, urlCategory, urlSort, urlSearch],
  );

  const catalogQuery = useStudentCatalogQuery(params);
  const categoriesQuery = useCategoriesQuery();

  const updateUrl = useCallback(
    (
      next: Partial<{
        page: number;
        category: string | null;
        sort: Sort;
        search: string;
      }>,
    ) => {
      const sp = new URLSearchParams(searchParams.toString());

      if ("search" in next) {
        const trimmed = (next.search ?? "").trim();
        if (trimmed.length > 0) sp.set("search", trimmed);
        else sp.delete("search");
      }
      if ("category" in next) {
        if (next.category) sp.set("category", next.category);
        else sp.delete("category");
      }
      if ("sort" in next) {
        if (next.sort && next.sort !== "latest") sp.set("sort", next.sort);
        else sp.delete("sort");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else if ("category" in next || "sort" in next || "search" in next) {
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

  const data = catalogQuery.data;
  const isFetching = catalogQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 9;
  const rangeStart = total === 0 ? 0 : (urlPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(urlPage * pageSize, total);

  const categoryItems = useMemo(() => {
    const list = categoriesQuery.data?.categories ?? [];
    return [
      {
        name: null as string | null,
        label: "Semua",
        count: categoriesQuery.data?.totalPublished,
      },
      ...list.map((c) => ({ name: c.name, label: c.name, count: c.courseCount })),
    ];
  }, [categoriesQuery.data]);

  return (
    <div className="flex flex-col gap-7">
      <Header />

      {/* Search + sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => {
            setSearchInput("");
            updateUrl({ search: "" });
          }}
        />

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:inline-flex dark:text-zinc-400">
            Urutkan
          </span>
          <select
            value={urlSort}
            onChange={(e) => updateUrl({ sort: e.target.value as Sort })}
            aria-label="Urutkan kursus"
            className="h-9 rounded-full bg-white px-3 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 focus:outline-none focus:ring-[color:var(--color-brand-400)] dark:bg-[color:var(--color-surface-card)] dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)]"
          >
            {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips row */}
      <CategoryChips
        items={categoryItems}
        active={urlCategory ?? null}
        loading={categoriesQuery.isPending}
        onSelect={(name) => updateUrl({ category: name })}
      />

      {/* Result count */}
      {!catalogQuery.isPending && !catalogQuery.isError && total > 0 ? (
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>
            Menampilkan{" "}
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              {rangeStart}
            </span>
            –
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              {rangeEnd}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              {total}
            </span>{" "}
            kursus
          </span>
          <span className="hidden items-center gap-2 sm:inline-flex">
            {isFetching ? (
              <Loader2 className="size-3.5 animate-spin text-[color:var(--color-brand-500)]" />
            ) : null}
            Halaman {urlPage} dari {totalPages}
          </span>
        </div>
      ) : null}

      {/* Grid / states */}
      {catalogQuery.isPending ? (
        <InProgressGridSkeleton count={6} />
      ) : catalogQuery.isError ? (
        <ErrorState onRetry={() => catalogQuery.refetch()} />
      ) : total === 0 ? (
        urlSearch.length > 0 ? (
          <NoSearchMatchState
            search={urlSearch}
            onClear={() => {
              setSearchInput("");
              updateUrl({ search: "" });
            }}
          />
        ) : (
          <NoFilterMatchState
            onReset={() => updateUrl({ category: null, sort: "latest" })}
          />
        )
      ) : (
        <>
          <div
            className={cn(
              "grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
              isFetching && "opacity-60",
            )}
          >
            {data!.courses.map((course) => (
              <CatalogCourseCard key={course.id} course={course} />
            ))}
          </div>

          <CatalogPagination
            current={urlPage}
            totalPages={totalPages}
            onChange={(p) => updateUrl({ page: p })}
          />
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Jelajah Katalog
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-300/70">
          Telusuri seluruh kursus NextLevel Academy. Kursus yang sudah kamu
          miliki ditandai dengan stempel <span className="font-semibold text-zinc-700 dark:text-zinc-200">Dimiliki</span>.
        </p>
      </div>
      <Link
        href="/my-courses"
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[12px] font-bold text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-200)] transition hover:bg-[color:var(--color-brand-50)] dark:bg-[color:var(--color-surface-card)] dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-surface-card-strong)]"
      >
        <BookOpen className="size-3.5" strokeWidth={2.4} />
        Kursus Saya
      </Link>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        strokeWidth={2}
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari kursus…"
        className="h-10 rounded-full bg-white pl-10 pr-9 dark:bg-[color:var(--color-surface-card)]"
        aria-label="Cari kursus"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-50"
          aria-label="Hapus pencarian"
        >
          <X className="size-3.5" strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  );
}

function CategoryChips({
  items,
  active,
  loading,
  onSelect,
}: {
  items: { name: string | null; label: string; count: number | undefined }[];
  active: string | null;
  loading: boolean;
  onSelect: (name: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400 sm:inline-flex">
        <Filter className="size-3.5" /> Kategori
      </span>
      {loading ? (
        <CategoryChipsSkeleton />
      ) : (
        items.map((chip) => {
          const isActive = (chip.name ?? null) === (active ?? null);
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onSelect(chip.name)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                isActive
                  ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_22px_-10px_rgba(43,114,234,0.7)]"
                  : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] hover:ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-surface-card)] dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-brand-500)]/10 dark:hover:text-[color:var(--color-brand-100)] dark:hover:ring-[color:var(--color-brand-400)]/60",
              )}
            >
              {chip.label}
              {chip.count != null ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive
                      ? "bg-white/20"
                      : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-[color:var(--color-surface-border)]",
                  )}
                >
                  {chip.count}
                </span>
              ) : null}
            </button>
          );
        })
      )}
    </div>
  );
}

function CategoryChipsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-7 w-24 rounded-full bg-zinc-100 dark:bg-white/5"
        />
      ))}
    </div>
  );
}

function CatalogPagination({
  current,
  totalPages,
  onChange,
}: {
  current: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Show first, last, current, and neighbors. Ellipsis in between when gaps.
  const pages = buildPageList(current, totalPages);

  return (
    <nav
      aria-label="Paginasi kursus"
      className="flex items-center justify-center gap-1.5 pt-2"
    >
      <button
        type="button"
        onClick={() => current > 1 && onChange(current - 1)}
        disabled={current <= 1}
        className="inline-flex size-9 items-center justify-center rounded-full bg-white text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-600 dark:bg-[color:var(--color-surface-card)] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-surface-card-strong)] dark:disabled:hover:bg-[color:var(--color-surface-card)]"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="size-4" strokeWidth={2.4} />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="px-1 text-xs text-zinc-400 dark:text-zinc-500"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full text-xs font-bold transition",
              p === current
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_22px_-10px_rgba(43,114,234,0.7)]"
                : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] dark:bg-[color:var(--color-surface-card)] dark:text-zinc-200 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-surface-card-strong)]",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => current < totalPages && onChange(current + 1)}
        disabled={current >= totalPages}
        className="inline-flex size-9 items-center justify-center rounded-full bg-white text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-600 dark:bg-[color:var(--color-surface-card)] dark:text-zinc-300 dark:ring-[color:var(--color-surface-border)] dark:hover:bg-[color:var(--color-surface-card-strong)] dark:disabled:hover:bg-[color:var(--color-surface-card)]"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="size-4" strokeWidth={2.4} />
      </button>
    </nav>
  );
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-12 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-14 place-items-center rounded-2xl bg-red-50 text-[color:var(--color-error)] dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-6" />
      </div>
      <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-50">
        Gagal memuat katalog
      </h3>
      <p className="max-w-md text-center text-sm text-zinc-500 dark:text-zinc-300/70">
        Sambungan ke server bermasalah. Coba muat ulang sebentar.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}

function NoSearchMatchState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-12 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-300">
        <Search className="size-5" />
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Tidak ada kursus yang cocok
      </p>
      <p className="max-w-md text-center text-xs text-zinc-500 dark:text-zinc-300/70">
        Tidak ada kursus dengan kata &ldquo;{search}&rdquo;. Coba kata kunci
        lain atau hapus pencarian.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[12px] font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        <X className="size-3.5" strokeWidth={2.4} />
        Hapus pencarian
      </button>
    </div>
  );
}

function NoFilterMatchState({ onReset }: { onReset: () => void }) {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-12 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
        <Sparkles className="size-5" />
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Tidak ada kursus untuk filter ini
      </p>
      <p className="max-w-md text-center text-xs text-zinc-500 dark:text-zinc-300/70">
        Coba pilih kategori lain atau setel ulang filter.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-[12px] font-bold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Reset filter
      </button>
    </div>
  );
}
