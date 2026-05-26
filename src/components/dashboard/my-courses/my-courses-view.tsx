"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Compass, Filter, Inbox, Search, X } from "lucide-react";

import { useMyCoursesQuery } from "@/hooks/use-dashboard";
import type { MyCoursesStatus } from "@/lib/student-data-loader";
import { MY_COURSES_STATUSES } from "@/lib/validators/my-courses";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { SearchBox } from "@/components/dashboard/shared/search-box";

import { InProgressGridSkeleton } from "../dashboard-skeletons";
import { StudentCourseCard } from "../student-course-card";

const STATUS_LABELS: Record<MyCoursesStatus, string> = {
  all: "Semua",
  "in-progress": "Sedang Dipelajari",
  completed: "Selesai",
};

function parseStatus(value: string | null): MyCoursesStatus {
  return (MY_COURSES_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as MyCoursesStatus)
    : "all";
}

export function MyCoursesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";
  const urlStatus = parseStatus(searchParams.get("status"));

  const [searchInput, setSearchInput] = useState(urlSearch);

  function pushParams(next: { search: string; status: MyCoursesStatus }) {
    const params = new URLSearchParams();
    if (next.search.trim().length > 0) params.set("search", next.search.trim());
    if (next.status !== "all") params.set("status", next.status);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Debounce: push the typed search value into the URL after the user stops
  // typing. Back/forward navigation updates the URL directly; we don't mirror
  // it back into the input because React Compiler disallows the cascading
  // setState pattern and the UX impact is negligible.
  useEffect(() => {
    if (searchInput === urlSearch) return;
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      const trimmed = searchInput.trim();
      if (trimmed.length > 0) params.set("search", trimmed);
      if (urlStatus !== "all") params.set("status", urlStatus);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
  }, [searchInput, urlSearch, urlStatus, pathname, router]);

  function handleStatusChange(value: unknown) {
    const next = parseStatus(typeof value === "string" ? value : null);
    pushParams({ search: searchInput, status: next });
  }

  function handleClearSearch() {
    setSearchInput("");
    pushParams({ search: "", status: urlStatus });
  }

  const filters = { search: urlSearch, status: urlStatus };

  const { data, isPending, isError } = useMyCoursesQuery(filters);
  const courses = data?.courses ?? [];

  const isDefaultView = urlSearch.length === 0 && urlStatus === "all";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Perpustakaan · Akses Seumur Hidup"
        title="Kursus"
        accent="saya"
        description="Daftar kursus yang sudah kamu miliki, terurut dari yang paling baru diakses. Lanjutkan dari titik terakhir kamu berhenti."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          onClear={handleClearSearch}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Tabs
            value={urlStatus}
            onValueChange={handleStatusChange}
            className="w-full sm:w-auto"
          >
            <TabsList className="h-9 w-full sm:w-auto">
              {MY_COURSES_STATUSES.map((s) => (
                <TabsTrigger key={s} value={s} className="text-[12px] font-semibold">
                  {STATUS_LABELS[s]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Link
            href="/catalog"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-[12px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)]"
          >
            <Compass className="size-3.5" strokeWidth={2.4} />
            Jelajah Katalog
          </Link>
        </div>
      </div>

      {isPending ? (
        <InProgressGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState />
      ) : courses.length === 0 ? (
        isDefaultView ? (
          <NoEnrollmentsState />
        ) : urlSearch.length > 0 ? (
          <NoSearchMatchState search={urlSearch} onClear={handleClearSearch} />
        ) : (
          <NoFilterMatchState status={urlStatus} />
        )
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c) => (
            <StudentCourseCard key={c.enrollmentId} item={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoEnrollmentsState() {
  return (
    <div className="grid place-items-center gap-4 rounded-3xl bg-white p-12 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-14 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
        <BookOpen className="size-6" />
      </div>
      <div className="text-center">
        <p className="font-heading text-base font-extrabold text-zinc-900 dark:text-zinc-50">
          Kamu belum memiliki kursus
        </p>
        <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
          Telusuri katalog NextLevel Academy dan beli kursus favoritmu untuk
          memulai perjalanan belajar.
        </p>
      </div>
      <Link
        href="/catalog"
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-6 text-[12px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)]"
      >
        <Compass className="size-3.5" strokeWidth={2.4} />
        Jelajah Katalog
      </Link>
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
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-300">
        <Search className="size-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Tidak ada kursus yang cocok
        </p>
        <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
          Tidak ada kursus dengan kata &ldquo;{search}&rdquo;. Coba kata kunci
          lain atau hapus pencarian.
        </p>
      </div>
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

function NoFilterMatchState({ status }: { status: MyCoursesStatus }) {
  const message =
    status === "completed"
      ? "Belum ada kursus yang selesai. Selesaikan kursus aktifmu untuk membukanya."
      : "Belum ada kursus yang sedang dipelajari.";
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-300">
        <Filter className="size-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Kosong di filter ini
        </p>
        <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-300/70">
          {message}
        </p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-5" />
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-300/70">
        Gagal memuat kursus. Coba muat ulang halaman.
      </p>
    </div>
  );
}
