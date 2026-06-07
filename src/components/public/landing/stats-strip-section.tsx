import { Suspense } from "react";

import { publicApi } from "@/lib/server-fetch";

import { SiteContainer } from "../site-container";
import { CountUp } from "./count-up";
import { StatsStripSkeleton } from "./landing-skeletons";
import { Reveal } from "./reveal";

export function StatsStripSection() {
  return (
    <section className="relative py-12">
      <SiteContainer>
        <Reveal
          from="scale"
          className="relative isolate overflow-hidden rounded-3xl px-8 py-10 text-white sm:px-12"
          style={{
            background:
              "radial-gradient(circle at 18% 14%, rgba(255,255,255,0.18) 0%, transparent 38%)," +
              "radial-gradient(circle at 92% 92%, var(--color-brand-700) 0%, transparent 50%)," +
              "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-500) 65%, var(--color-brand-700) 100%)",
          }}
        >
          {/* Decorative grid + noise */}
          <div className="auth-grid-pattern absolute inset-0 opacity-20" />
          <div className="auth-noise absolute inset-0 opacity-10 mix-blend-overlay" />
          {/* Yellow corner */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(244,214,0,0.35) 0%, transparent 65%)",
            }}
          />

          <Suspense fallback={<StatsStripSkeleton />}>
            <StatsStripData />
          </Suspense>
        </Reveal>
      </SiteContainer>
    </section>
  );
}

async function StatsStripData() {
  const data = await publicApi<{
    learners: number;
    courses: number;
    enrollments: number;
    completionRate: number;
  }>("/api/public/stats");

  const items: { num: React.ReactNode; label: string }[] = [
    { num: <CountUp value={data.learners} suffix="+" />, label: "Peserta aktif" },
    { num: <CountUp value={data.courses} suffix="+" />, label: "Kursus dirilis" },
    { num: <CountUp value={data.enrollments} suffix="+" />, label: "Enrollment aktif" },
    {
      num:
        data.enrollments > 0 ? (
          <CountUp value={data.completionRate} suffix="%" />
        ) : (
          "—"
        ),
      label: "Completion rate",
    },
  ];

  return (
    <div
      data-testid="stats-strip"
      className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4"
    >
      {items.map(({ num, label }, i) => (
        <div
          key={label}
          className="relative flex flex-col items-start gap-1 px-4 first:pl-0 last:pr-0 sm:px-6"
        >
          {i > 0 ? (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/20 sm:block"
            />
          ) : null}
          <div className="font-heading text-3xl font-extrabold leading-none sm:text-4xl">
            {num}
          </div>
          <div className="text-[12px] uppercase tracking-[0.18em] text-white/75">
            <span className="mr-1.5 inline-block size-1 rounded-full bg-[color:var(--color-brand-accent)] align-middle" />
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
