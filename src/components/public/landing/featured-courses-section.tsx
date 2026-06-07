import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { publicApi } from "@/lib/server-fetch";

import { SiteContainer } from "../site-container";
import { CourseCard, type CourseCardData } from "./course-card";
import { FeaturedCoursesSkeleton } from "./landing-skeletons";
import { Reveal } from "./reveal";

export function FeaturedCoursesSection() {
  return (
    <section id="courses" className="relative py-20 sm:py-24">
      <SiteContainer>
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              Kursus Pilihan
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Kursus pilihan untuk kamu mulai.
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-zinc-600">
              Kurasi tim NextLevel: kursus paling diminati dan relevan dengan karir digital di
              Indonesia.
            </p>
          </div>

          <Link
            href="/courses"
            className="group inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--color-brand-800)] ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)] hover:ring-[color:var(--color-brand-300)]"
          >
            Lihat semua kursus
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <Suspense fallback={<FeaturedCoursesSkeleton />}>
          <FeaturedCoursesData />
        </Suspense>
      </SiteContainer>
    </section>
  );
}

async function FeaturedCoursesData() {
  const { courses } = await publicApi<{ courses: CourseCardData[] }>(
    "/api/public/featured-courses",
  );

  if (courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      data-testid="featured-courses"
      className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {courses.map((course, i) => (
        <Reveal key={course.id} delay={(i % 3) * 90} className="flex">
          <CourseCard course={course} className="w-full" />
        </Reveal>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 grid place-items-center rounded-3xl bg-white p-12 ring-1 ring-zinc-200">
      <div className="grid size-14 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]">
        <Sparkles className="size-6" strokeWidth={2.1} />
      </div>
      <h3 className="mt-5 font-heading text-lg font-bold text-zinc-900">
        Kursus baru segera hadir
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
        Tim kurikulum sedang menyiapkan kursus pertama. Tinggalkan email kamu di footer supaya
        jadi yang pertama tahu.
      </p>
    </div>
  );
}
