import { Quote } from "lucide-react";

import { SiteContainer } from "../site-container";
import { Reveal } from "./reveal";

const TESTIMONIALS = [
  {
    initials: "RP",
    name: "Rafi P.",
    role: "Peserta Didik",
    course: "Web Programming · Batch 1",
    quote:
      "Gamifikasi EXP-nya beneran bikin nagih. Tiap selesai sprint kayak unlock achievement, dan voucher Lv 5 nyusul tepat sebelum aku checkout kursus kedua.",
  },
  {
    initials: "DA",
    name: "Dwi A.",
    role: "Peserta Magang",
    course: "Data Analyst · Batch 2",
    quote:
      "Sistem absensi dan tugasnya rapi. Mentor selalu kasih feedback dalam 24 jam, dan rekap nilai akhirku bisa langsung dipakai sebagai portofolio.",
  },
  {
    initials: "SK",
    name: "Sari K.",
    role: "Mentor",
    course: "UI/UX Design",
    quote:
      "Sebagai mentor, dashboard kelasnya menyenangkan. Aku bisa lihat progres tiap peserta tanpa harus spreadsheet manual — semuanya sudah ada.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <SiteContainer>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
            <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
            Cerita pembelajar
          </span>
          <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Dari mereka yang sudah naik level.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <Reveal
              key={t.name}
              as="figure"
              delay={idx * 110}
              className="group relative isolate flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-zinc-200/80 transition duration-300 hover:-translate-y-1 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_30px_50px_-30px_rgba(35,65,137,0.35)]"
            >
              {/* Big editorial quote mark */}
              <Quote
                className="absolute -right-4 -top-4 size-24 text-[color:var(--color-brand-50)]"
                strokeWidth={1.5}
              />

              <div className="relative flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-[color:var(--color-brand-accent)] font-heading text-base font-extrabold text-[color:var(--color-brand-900)] shadow-[0_10px_22px_-12px_rgba(244,214,0,0.8)]">
                  {t.initials}
                </div>
                <div>
                  <div className="font-heading text-sm font-bold text-zinc-900">{t.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {t.role}
                  </div>
                </div>
                <span className="ml-auto font-mono text-[11px] text-zinc-300">0{idx + 1}</span>
              </div>

              <blockquote className="relative mt-6 flex-1 text-[15px] leading-relaxed text-zinc-700">
                “{t.quote}”
              </blockquote>

              <figcaption className="relative mt-6 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                {t.course}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
