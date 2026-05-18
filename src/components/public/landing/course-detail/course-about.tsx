import { SiteContainer } from "@/components/public/site-container";

type Props = { description: string };

export function CourseAbout({ description }: Props) {
  const paragraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="tentang" className="relative py-16 sm:py-20 scroll-mt-24">
      <SiteContainer>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              Tentang Kursus
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Apa yang akan kamu pelajari di sini.
            </h2>
          </div>

          <div className="space-y-5 text-[15px] leading-[1.85] text-zinc-700">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:font-heading first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.85] first-letter:text-[color:var(--color-brand-700)]"
                    : undefined
                }
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
