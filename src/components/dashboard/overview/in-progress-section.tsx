"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { useInProgressCoursesQuery } from "@/hooks/use-dashboard";

import { InProgressGridSkeleton } from "../dashboard-skeletons";
import { StudentCourseCard } from "../student-course-card";

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data!.courses.map((c) => (
            <StudentCourseCard key={c.enrollmentId} item={c} />
          ))}
        </div>
      )}
    </section>
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
