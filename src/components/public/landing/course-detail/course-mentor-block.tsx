import { Quote } from "lucide-react";

import { SiteContainer } from "@/components/public/site-container";

type Props = {
  instructor: string;
  bio: string;
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function CourseMentorBlock({ instructor, bio }: Props) {
  return (
    <section id="mentor" className="relative py-16 sm:py-20 scroll-mt-24">
      <SiteContainer>
        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
            <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
            Mentor Kursus
          </span>
          <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Siapa yang akan mendampingi kamu.
          </h2>

          <figure className="relative mt-10 overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-zinc-200 sm:p-10">
            <Quote
              aria-hidden
              className="absolute right-6 top-6 size-24 text-[color:var(--color-brand-50)]"
              strokeWidth={1.5}
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-brand-accent)] font-heading text-2xl font-extrabold text-[color:var(--color-brand-900)] shadow-[0_18px_36px_-16px_rgba(244,214,0,0.8)]">
                {initialsOf(instructor) || "NL"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-xl font-extrabold leading-tight text-zinc-900 sm:text-2xl">
                  {instructor}
                </h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
                  Instruktur Kursus · NextLevel Academy
                </p>
                <blockquote className="mt-5 text-[15px] leading-[1.85] text-zinc-700">
                  {bio}
                </blockquote>
              </div>
            </div>
          </figure>
        </div>
      </SiteContainer>
    </section>
  );
}
