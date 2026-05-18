import { Check } from "lucide-react";

import { SiteContainer } from "@/components/public/site-container";

type Props = {
  benefits: { id: string; text: string; order: number }[];
};

export function CourseBenefitsBlock({ benefits }: Props) {
  if (benefits.length === 0) return null;

  return (
    <section id="benefit" className="relative py-16 sm:py-20 scroll-mt-24">
      <SiteContainer>
        <div className="rounded-3xl bg-white p-8 ring-1 ring-zinc-200 sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-accent)]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-accent)]/40">
                <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
                Yang akan kamu dapatkan
              </span>
              <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Bukan sekadar nonton video.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                Setelah menyelesaikan kursus ini, kamu akan menguasai keterampilan berikut secara
                praktis — bukan teori semata.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {benefits.map((b, idx) => (
                <li
                  key={b.id}
                  className="group relative flex items-start gap-3 rounded-2xl bg-[color:var(--color-brand-50)]/60 p-4 ring-1 ring-[color:var(--color-brand-100)] transition hover:bg-[color:var(--color-brand-50)]"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-accent)] text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(244,214,0,0.8)]">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-800">{b.text}</p>
                  <span className="absolute right-3 top-3 font-mono text-[10px] text-zinc-300">
                    0{idx + 1}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
