"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudentCourseCardDTO } from "@/lib/student-data-loader";
import { useInProgressCoursesQuery } from "@/hooks/use-dashboard";

import { InProgressGridSkeleton } from "../dashboard-skeletons";

export function InProgressSection() {
  const { data, isPending, isError } = useInProgressCoursesQuery();

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Lanjutkan Belajar"
        helper="Kursus yang sedang kamu pelajari"
        ctaHref="/my-courses"
        ctaLabel="Semua kursus"
      />

      {isPending ? (
        <InProgressGridSkeleton count={3} />
      ) : isError ? (
        <ErrorState />
      ) : data!.courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data!.courses.map((c) => (
            <InProgressCard key={c.enrollmentId} item={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function InProgressCard({ item }: { item: StudentCourseCardDTO }) {
  const pct = Math.round(item.progressPct);
  const { course } = item;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 transition",
        "hover:-translate-y-0.5 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_24px_50px_-28px_rgba(35,65,137,0.35)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/60 dark:hover:shadow-[0_24px_50px_-26px_rgba(71,142,244,0.45)]",
      )}
    >
      <Link
        href={`/learn/${course.slug}`}
        className="relative block aspect-[16/9] overflow-hidden"
      >
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 380px"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brand-800)] ring-1 ring-white/60 backdrop-blur dark:bg-[color:var(--color-surface-card-strong)]/95 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-surface-border)]">
          <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
          {course.category.name}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/learn/${course.slug}`} className="group/title">
          <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-zinc-900 transition group-hover/title:text-[color:var(--color-brand-700)] dark:text-zinc-50 dark:group-hover/title:text-[color:var(--color-brand-300)]">
            {course.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-300/80">
          <span className="inline-flex items-center gap-1">
            <span className="grid size-4 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[8px] font-bold text-[color:var(--color-brand-800)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
              {course.instructor[0]?.toUpperCase() ?? "N"}
            </span>
            {course.instructor}
          </span>
          {course.estimatedDuration ? (
            <>
              <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-500" />
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {Math.round(course.estimatedDuration / 60)} jam
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-300/80">
            <span>Progres</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-50">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-brand-700)] transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <Link
            href={`/learn/${course.slug}`}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-brand-500)] px-4 text-[12px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)]"
          >
            <PlayCircle className="size-3.5" strokeWidth={2.4} />
            Lanjutkan belajar
          </Link>
        </div>
      </div>
    </article>
  );
}

function SectionHeader({
  title,
  helper,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  helper?: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {helper ? (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-300/70">{helper}</p>
        ) : null}
      </div>
      <Link
        href={ctaHref}
        className="group inline-flex items-center gap-1 text-xs font-bold text-[color:var(--color-brand-700)] transition hover:text-[color:var(--color-brand-800)] dark:text-[color:var(--color-brand-300)] dark:hover:text-[color:var(--color-brand-100)]"
      >
        {ctaLabel}
        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl bg-white p-10 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
        <PlayCircle className="size-5" />
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Belum ada kursus aktif
      </p>
      <p className="max-w-md text-center text-xs text-zinc-500 dark:text-zinc-300/70">
        Mulai kursus dari rekomendasi di bawah untuk membuka EXP dan progres.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-300/70">
      Gagal memuat kursus aktif. Coba muat ulang halaman.
    </p>
  );
}
