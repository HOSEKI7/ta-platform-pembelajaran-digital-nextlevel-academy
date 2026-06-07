import { Award, Compass, PlayCircle, Zap } from "lucide-react";

import { SiteContainer } from "../site-container";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: Compass,
    title: "Pilih kursus",
    body: "Telusuri katalog atau filter berdasarkan kategori dan level.",
  },
  {
    icon: PlayCircle,
    title: "Belajar & kumpulkan EXP",
    body: "Tonton, kerjakan quiz, kumpulkan +15 / +90 XP per aktivitas.",
  },
  {
    icon: Zap,
    title: "Naik level, raih voucher",
    body: "Voucher 20% di Lv 5, 35% di Lv 10, 50% di Lv 15 — otomatis.",
  },
  {
    icon: Award,
    title: "Selesai & cetak sertifikat",
    body: "100% progres → sertifikat PDF dengan ID verifikasi publik.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <SiteContainer>
        <Reveal className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              Cara kerjanya
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Dari penasaran ke bersertifikat dalam 4 langkah.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-zinc-600">
            Tidak ada subscription. Bayar sekali, akses seumur hidup. Tiap langkah memberikan
            sinyal progres yang jelas — kamu selalu tahu posisinya di mana.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* Dashed connecting rail (md+).
              Icons sit at the LEFT edge of each grid cell, so the rail must
              start at the first icon's center (28px from the wrapper's left)
              and end at the LAST icon's center, which lives one column width
              minus 28px from the right edge — i.e. calc(25% - 52px) given the
              4-equal-column grid with 32px (gap-8) gutters:
                col_w = (container - 3 * 32) / 4
                right_offset = col_w - 28 = container/4 - 24 - 28
                             = 25% - 52px
              Previously we used `inset-x-12`, which stopped the rail near the
              third icon and left the last step orphaned. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute left-7 right-[calc(25%_-_3.25rem)] top-7 hidden text-[color:var(--color-brand-300)] md:block"
            height="2"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
          </svg>

          <ol className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, idx) => (
              <Reveal key={title} as="li" delay={idx * 110} className="group relative">
                <div className="relative grid size-14 place-items-center rounded-2xl bg-white shadow-[0_18px_36px_-18px_rgba(35,65,137,0.35)] ring-1 ring-zinc-200 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_44px_-18px_rgba(35,65,137,0.5)] group-hover:ring-[color:var(--color-brand-300)]">
                  <Icon className="size-6 text-[color:var(--color-brand-700)]" strokeWidth={2.1} />
                  <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-[color:var(--color-brand-accent)] font-mono text-[11px] font-bold text-[color:var(--color-brand-900)] shadow-[0_6px_14px_-6px_rgba(244,214,0,0.8)]">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-base font-bold text-zinc-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </SiteContainer>
    </section>
  );
}
