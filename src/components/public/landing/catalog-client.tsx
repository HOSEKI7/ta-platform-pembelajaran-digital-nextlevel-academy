"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Loader2, Sparkles } from "lucide-react";

import { type CoursesPageParams, type Sort, parsePage, parseSort } from "@/lib/courses-query";
import { useCategoriesQuery } from "@/hooks/use-categories";
import { useCoursesQuery } from "@/hooks/use-courses";
import { cn } from "@/lib/utils";

import { SiteContainer } from "@/components/public/site-container";

import { CourseCard } from "./course-card";
import { CoursesPagination } from "./courses-pagination";
import { FeaturedCoursesSkeleton } from "./landing-skeletons";

const SORT_LABELS: Record<Sort, string> = {
  latest: "Terbaru",
  popular: "Terpopuler",
  "price-asc": "Harga: rendah → tinggi",
  "price-desc": "Harga: tinggi → rendah",
};

function paramsFromSearchParams(sp: URLSearchParams): CoursesPageParams {
  return {
    page: parsePage(sp.get("page")),
    category: sp.get("category") ?? null,
    sort: parseSort(sp.get("sort")),
  };
}

export function CatalogClient() {
  const searchParams = useSearchParams();

  // ponytail: local state so filter changes don't trigger server round-trip.
  const [params, setParams] = useState(() => paramsFromSearchParams(searchParams));
  const [prevSp, setPrevSp] = useState(searchParams);
  if (searchParams !== prevSp) {
    setPrevSp(searchParams);
    setParams(paramsFromSearchParams(searchParams));
  }

  const coursesQuery = useCoursesQuery(params);
  const categoriesQuery = useCategoriesQuery();

  const { page, category, sort } = params;

  const updateUrl = useCallback(
    (next: Partial<{ page: number; category: string | null; sort: Sort }>) => {
      const newParams = { ...params, ...next };
      if ("category" in next || "sort" in next) newParams.page = 1;

      const sp = new URLSearchParams();
      if (newParams.category) sp.set("category", newParams.category);
      if (newParams.sort && newParams.sort !== "latest") sp.set("sort", newParams.sort);
      if (newParams.page > 1) sp.set("page", String(newParams.page));
      const qs = sp.toString();

      window.history.replaceState(null, "", `/courses${qs ? `?${qs}` : ""}#courses-grid`);
      setParams(newParams);
    },
    [params],
  );

  const data = coursesQuery.data;
  const isFetching = coursesQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * (data?.pageSize ?? 9) + 1;
  const rangeEnd = Math.min(page * (data?.pageSize ?? 9), total);

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
    <>
      {/* Filter bar */}
      <section className="py-6">
        <SiteContainer>
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <Filter className="size-3.5" /> Filter
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              {categoriesQuery.isPending ? (
                <CategoryChipsSkeleton />
              ) : (
                categoryItems.map((chip) => {
                  const active = (chip.name ?? null) === (category ?? null);
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => updateUrl({ category: chip.name })}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        active
                          ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_22px_-10px_rgba(43,114,234,0.7)]"
                          : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-800)] hover:ring-[color:var(--color-brand-200)]",
                      )}
                    >
                      {chip.label}
                      {chip.count != null ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px]",
                            active
                              ? "bg-white/20"
                              : "bg-white text-zinc-500 ring-1 ring-zinc-200",
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

            <select
              value={sort}
              onChange={(e) => updateUrl({ sort: e.target.value as Sort })}
              aria-label="Urutkan kursus"
              className="rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 focus:outline-none focus:ring-[color:var(--color-brand-400)]"
            >
              {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
                <option key={s} value={s}>
                  {SORT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </SiteContainer>
      </section>

      {/* Grid */}
      <section id="courses-grid" className="py-12 pb-24 scroll-mt-24">
        <SiteContainer>
          {/* Result count */}
          {total > 0 ? (
            <div className="mb-6 flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>
                Menampilkan{" "}
                <span className="font-bold text-zinc-900">{rangeStart}</span>–
                <span className="font-bold text-zinc-900">{rangeEnd}</span> dari{" "}
                <span className="font-bold text-zinc-900">{total}</span> kursus
              </span>
              <span className="hidden items-center gap-2 sm:inline-flex">
                {isFetching ? (
                  <Loader2 className="size-3.5 animate-spin text-[color:var(--color-brand-500)]" />
                ) : null}
                Halaman {page} dari {totalPages}
              </span>
            </div>
          ) : null}

          {coursesQuery.isPending ? (
            <FeaturedCoursesSkeleton />
          ) : coursesQuery.isError ? (
            <ErrorState onRetry={() => coursesQuery.refetch()} />
          ) : total === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div
                data-testid="catalog-grid"
                data-fetching={isFetching ? "true" : "false"}
                className={cn(
                  "grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
                  isFetching && "opacity-60",
                )}
              >
                {data!.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              <CoursesPagination
                current={page}
                totalPages={totalPages}
                hrefFor={(p) => buildPageHref(params, p)}
              />
            </>
          )}
        </SiteContainer>
      </section>
    </>
  );
}

function buildPageHref(current: CoursesPageParams, page: number): string {
  const sp = new URLSearchParams();
  if (current.category) sp.set("category", current.category);
  if (current.sort && current.sort !== "latest") sp.set("sort", current.sort);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/courses?${qs}#courses-grid` : "/courses#courses-grid";
}

function CategoryChipsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="relative h-7 w-24 overflow-hidden rounded-full bg-zinc-100 before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(71,142,244,0.18)_45%,rgba(244,214,0,0.12)_55%,transparent_75%)] before:[animation:landing-shimmer_1.6s_ease-in-out_infinite]"
        />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center rounded-3xl bg-white p-12 ring-1 ring-zinc-200">
      <div className="grid size-14 place-items-center rounded-2xl bg-red-50 text-[color:var(--color-error)]">
        <Sparkles className="size-6" />
      </div>
      <h3 className="mt-5 font-heading text-lg font-bold text-zinc-900">
        Gagal memuat kursus
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
        Sambungan ke server bermasalah. Coba muat ulang sebentar.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center rounded-3xl bg-white p-12 ring-1 ring-zinc-200">
      <div className="grid size-14 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]">
        <Sparkles className="size-6" />
      </div>
      <h3 className="mt-5 font-heading text-lg font-bold text-zinc-900">
        Tidak ada kursus untuk filter ini
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
        Coba pilih kategori lain atau ubah urutan pencarian.
      </p>
    </div>
  );
}
