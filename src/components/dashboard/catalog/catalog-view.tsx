"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Filter,
  Inbox,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import {
  type Sort,
  type StudentCatalogCourse,
  type StudentCatalogParams,
  parsePage,
  parseSearch,
  parseSort,
} from "@/lib/student-catalog-query";
import { useCategoriesQuery } from "@/hooks/use-categories";
import { useStudentCatalogQuery } from "@/hooks/use-student-catalog";
import { cn } from "@/lib/utils";

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

import { InProgressGridSkeleton } from "../dashboard-skeletons";

import { CatalogCourseCard } from "./catalog-course-card";
import { CoursePreviewDialog } from "./course-preview-dialog";

const SORT_LABELS: Record<Sort, string> = {
  latest: "Terbaru",
  popular: "Terpopuler",
  "price-asc": "Harga: rendah → tinggi",
  "price-desc": "Harga: tinggi → rendah",
};

type Props = {
  /** When set (via `/catalog?preview=<slug>`), the course's preview popup opens
   *  on load — server-resolved so it works regardless of page/filter. */
  initialPreview?: StudentCatalogCourse | null;
};

export function CatalogView({ initialPreview = null }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Deep-link preview popup. Seeded once from the server-loaded course; closing
  // strips `?preview=` so a refresh/back doesn't reopen it.
  const [previewCourse] = useState(initialPreview);
  const [previewOpen, setPreviewOpen] = useState(Boolean(initialPreview));

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("preview");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

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
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Eksplorasi · Katalog Lengkap"
        title="Jelajah"
        accent="katalog"
        description="Telusuri seluruh kursus NextLevel Academy. Kursus yang sudah kamu miliki ditandai dengan stempel Dimiliki."
      />

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
          <label
            htmlFor="catalog-sort"
            className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 sm:inline-flex dark:text-zinc-400"
          >
            Urutkan
          </label>
          <Select
            value={urlSort}
            onValueChange={(value) => {
              if (typeof value === "string") updateUrl({ sort: value as Sort });
            }}
          >
            <SelectTrigger
              id="catalog-sort"
              className="h-10 min-w-48 rounded-full"
              aria-label="Urutkan kursus"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              "grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              isFetching && "opacity-60",
            )}
          >
            {data!.courses.map((course) => (
              <CatalogCourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="pt-2">
            <Pagination
              page={urlPage}
              totalPages={totalPages}
              onChange={(p) => updateUrl({ page: p })}
              ariaLabel="Paginasi katalog kursus"
            />
          </div>
        </>
      )}

      {/* Deep-link preview popup (`?preview=<slug>`) */}
      {previewCourse ? (
        <CoursePreviewDialog
          course={previewCourse}
          open={previewOpen}
          onOpenChange={(o) => {
            if (!o) closePreview();
            else setPreviewOpen(true);
          }}
        />
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
