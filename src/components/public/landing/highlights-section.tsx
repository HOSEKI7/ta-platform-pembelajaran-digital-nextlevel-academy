import { Award, BookOpen, Briefcase, Trophy } from "lucide-react";

import { SiteContainer } from "../site-container";

const HIGHLIGHTS = [
  {
    icon: BookOpen,
    title: "Belajar Bertahap",
    body:
      "Struktur sprint → module → submateri yang membuat progres terasa terukur, bukan menumpuk tanpa arah.",
    accent: "01",
  },
  {
    icon: Trophy,
    title: "Gamifikasi EXP & Level",
    body:
      "+15 XP tiap video, +90 XP quiz pertama, +600 XP saat kursus selesai. Naik level, raih voucher.",
    accent: "02",
  },
  {
    icon: Award,
    title: "Sertifikat Resmi",
    body:
      "Sertifikat PDF dengan ID unik dapat diverifikasi publik. Bisa dipasang di LinkedIn dengan satu klik.",
    accent: "03",
  },
  {
    icon: Briefcase,
    title: "Magang Terintegrasi",
    body:
      "Sistem batch + kelas, absensi, tugas, mentor 1-on-1, dan rekap nilai akhir — semua dalam satu tempat.",
    accent: "04",
  },
];

export function HighlightsSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <SiteContainer>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
            <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
            Kenapa NextLevel
          </span>
          <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Empat hal yang membuat kamu betah belajar.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Bukan sekadar kursus video. Setiap sesi dirancang supaya kamu pulang membawa skill,
            sertifikat, dan rasa pencapaian.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, body, accent }) => (
            <article
              key={title}
              className="group relative isolate overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-zinc-200/80 transition hover:-translate-y-1 hover:ring-[color:var(--color-brand-300)] hover:shadow-[0_30px_50px_-30px_rgba(35,65,137,0.35)]"
            >
              {/* Yellow corner tab */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rotate-45 bg-[color:var(--color-brand-accent)]/85 transition group-hover:scale-110"
              />
              {/* Soft backdrop */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, rgba(71,142,244,0.18) 0%, transparent 70%)",
                }}
              />

              <div className="relative">
                <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
                  <Icon className="size-6" strokeWidth={2.1} />
                </div>
                <div className="mt-6 flex items-baseline justify-between">
                  <h3 className="font-heading text-lg font-bold text-zinc-900">{title}</h3>
                  <span className="font-mono text-[11px] font-semibold text-zinc-400">{accent}</span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
