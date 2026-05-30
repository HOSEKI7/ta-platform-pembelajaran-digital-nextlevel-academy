"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Inbox, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import {
  type AdminCourseCategory,
  type AdminCourseRow,
  type AdminCoursesParams,
  type StatusFilter,
  parsePage,
  parseSearch,
  parseStatus,
} from "@/lib/admin-courses-query";
import { useAdminCoursesQuery } from "@/hooks/use-admin-courses";
import { useDeleteCourseMutation } from "@/hooks/use-admin-course-actions";

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

import { CoursesTable } from "./courses-table";
import { DeleteCourseDialog } from "./delete-course-dialog";

type Props = {
  categories: AdminCourseCategory[];
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Semua Status",
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const ALL_CATEGORIES = "__all__";

export function AdminCoursesView({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePage(searchParams.get("page"));
  const urlCategory = searchParams.get("category");
  const urlStatus = parseStatus(searchParams.get("status"));
  const urlSearch = parseSearch(searchParams.get("search"));

  const [searchInput, setSearchInput] = useState(urlSearch);

  const params: AdminCoursesParams = useMemo(
    () => ({
      page: urlPage,
      category: urlCategory ?? null,
      status: urlStatus,
      search: urlSearch,
    }),
    [urlPage, urlCategory, urlStatus, urlSearch],
  );

  const coursesQuery = useAdminCoursesQuery(params);
  const deleteMutation = useDeleteCourseMutation();

  const [courseToDelete, setCourseToDelete] = useState<AdminCourseRow | null>(
    null,
  );

  const updateUrl = useCallback(
    (
      next: Partial<{
        page: number;
        category: string | null;
        status: StatusFilter;
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
      if ("status" in next) {
        if (next.status && next.status !== "all") sp.set("status", next.status);
        else sp.delete("status");
      }
      if ("page" in next) {
        if (next.page && next.page > 1) sp.set("page", String(next.page));
        else sp.delete("page");
      } else if ("category" in next || "status" in next || "search" in next) {
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

  const data = coursesQuery.data;
  const isFetching = coursesQuery.isFetching;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 10;
  const rangeStart = total === 0 ? 0 : (urlPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(urlPage * pageSize, total);

  const handleConfirmDelete = useCallback(() => {
    if (!courseToDelete) return;
    deleteMutation.mutate(courseToDelete.id, {
      onSuccess: () => {
        toast.success(`Kursus “${courseToDelete.title}” dihapus.`);
        setCourseToDelete(null);
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal menghapus kursus.",
        ),
    });
  }, [courseToDelete, deleteMutation]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Manajemen"
        title="Kelola"
        accent="Kursus"
        description="Kelola seluruh kursus platform — buat, sunting, arsipkan, atau hapus."
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
          placeholder="Cari judul kursus…"
          ariaLabel="Cari judul kursus"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={urlCategory ?? ALL_CATEGORIES}
            onValueChange={(value) => {
              if (typeof value !== "string") return;
              updateUrl({
                category: value === ALL_CATEGORIES ? null : value,
              });
            }}
          >
            <SelectTrigger
              className="h-10 min-w-44 rounded-full"
              aria-label="Filter kategori"
            >
              <SelectValue>
                {(value: string) =>
                  !value || value === ALL_CATEGORIES ? "Semua Kategori" : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name} ({c.courseCount})
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

          <Link
            href="/admin/courses/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
          >
            <Plus className="size-4" strokeWidth={2.6} />
            Tambah Kursus
          </Link>
        </div>
      </div>

      {/* Table card */}
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        {/* Card header: identity + result count */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <BookOpen className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Kursus
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
                    kursus
                  </>
                ) : (
                  "Tidak ada kursus untuk filter ini"
                )}
              </p>
            </div>
          </div>
          {isFetching ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[color:var(--color-brand-500)]" />
          ) : null}
        </div>

        {coursesQuery.isPending ? (
          <TableSkeleton />
        ) : coursesQuery.isError ? (
          <ErrorState onRetry={() => coursesQuery.refetch()} />
        ) : total === 0 ? (
          <EmptyState
            search={urlSearch}
            onReset={() => {
              setSearchInput("");
              updateUrl({ search: "", category: null, status: "all" });
            }}
          />
        ) : (
          <CoursesTable
            courses={data!.courses}
            isFetching={isFetching}
            onDelete={setCourseToDelete}
          />
        )}
      </section>

      {totalPages > 1 ? (
        <Pagination
          page={urlPage}
          totalPages={totalPages}
          onChange={(p) => updateUrl({ page: p })}
          ariaLabel="Paginasi daftar kursus"
        />
      ) : null}

      <DeleteCourseDialog
        open={courseToDelete !== null}
        onOpenChange={(o) => {
          if (!o && !deleteMutation.isPending) setCourseToDelete(null);
        }}
        courseTitle={courseToDelete?.title ?? ""}
        deleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-16 shrink-0 rounded-lg bg-zinc-100 dark:bg-white/5" />
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
        Gagal memuat daftar kursus
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
          ? `Tidak ada kursus dengan kata “${search}”`
          : "Belum ada kursus untuk filter ini"}
      </p>
      <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
        Coba ubah kata kunci, kategori, atau status — atau setel ulang filter.
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
