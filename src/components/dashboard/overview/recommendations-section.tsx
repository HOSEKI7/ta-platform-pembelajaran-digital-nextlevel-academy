"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { idr } from "@/lib/format";
import type { RecommendedCourseDTO } from "@/lib/student-data-loader";
import { useRecommendedCoursesQuery } from "@/hooks/use-dashboard";

import { CoursePreviewDialog } from "@/components/dashboard/catalog/course-preview-dialog";
import { RecommendationsGridSkeleton } from "../dashboard-skeletons";

export function RecommendationsSection() {
  const { data, isPending, isError } = useRecommendedCoursesQuery();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Rekomendasi Untukmu
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-300/70">
            Kursus pilihan yang belum kamu ambil
          </p>
        </div>
        <Link
          href="/catalog"
          className="group inline-flex items-center gap-1 text-xs font-bold text-[color:var(--color-brand-700)] transition hover:text-[color:var(--color-brand-800)] dark:text-[color:var(--color-brand-300)] dark:hover:text-[color:var(--color-brand-100)]"
        >
          Jelajah katalog
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      {isPending ? (
        <RecommendationsGridSkeleton count={4} />
      ) : isError ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-300/70">
          Gagal memuat rekomendasi.
        </p>
      ) : data!.courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data!.courses.map((c) => (
            <RecommendationCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecommendationCard({ course }: { course: RecommendedCourseDTO }) {
  const hasDiscount = course.fakePrice && course.fakePrice > course.price;
  // Lazy-mount: only spin up the Dialog once the user actually clicks. See
  // catalog-course-card.tsx for the full rationale.
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpen = () => {
    setHasOpened(true);
    setOpen(true);
  };

  return (
    <article
      aria-label={course.title}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 transition",
        "hover:-translate-y-0.5 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_24px_50px_-28px_rgba(35,65,137,0.35)]",
        "focus-within:ring-2 focus-within:ring-[color:var(--color-brand-400)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/60 dark:hover:shadow-[0_24px_50px_-26px_rgba(71,142,244,0.45)]",
      )}
    >
      {/* Transparent click overlay — opens the preview popup. */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Lihat ringkasan kursus ${course.title}`}
        className="absolute inset-0 z-30 cursor-pointer rounded-3xl bg-transparent focus:outline-none"
      />

      <div className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 280px"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          unoptimized
        />
        <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-brand-800)] ring-1 ring-white/60 backdrop-blur dark:bg-[color:var(--color-surface-card-strong)]/95 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-surface-border)]">
          <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
          {course.category.name}
        </span>
        {hasDiscount ? (
          <span className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-accent)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--color-brand-900)]">
            <Sparkles className="size-2.5" strokeWidth={2.6} />
            Hemat
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-heading text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          {course.title}
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-300/70">
          oleh {course.instructor}
        </p>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {hasDiscount ? (
              <div className="text-[10px] text-zinc-400 line-through dark:text-zinc-500">
                {idr.format(course.fakePrice!)}
              </div>
            ) : null}
            <div className="font-heading text-base font-extrabold text-zinc-900 dark:text-zinc-50">
              {idr.format(course.price)}
            </div>
          </div>
          <span
            aria-hidden
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-800)] transition",
              "group-hover:bg-[color:var(--color-brand-500)] group-hover:text-white",
              "dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:group-hover:bg-[color:var(--color-brand-500)] dark:group-hover:text-white",
            )}
          >
            <ArrowUpRight className="size-4" strokeWidth={2.4} />
          </span>
        </div>
      </div>

      {hasOpened ? (
        <CoursePreviewDialog
          course={{ ...course, isOwned: false }}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </article>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
        <Sparkles className="size-5" />
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Kamu sudah mengambil semua kursus tersedia
      </p>
      <p className="max-w-md text-center text-xs text-zinc-500 dark:text-zinc-300/70">
        Tunggu rilisan kursus berikutnya — biasanya tiap minggu ada baru.
      </p>
    </div>
  );
}
