import { RichTextContent } from "@/components/internship/tasks/rich-text-content";
import { SiteContainer } from "@/components/public/site-container";

type Props = { description: string };

export function CourseAbout({ description }: Props) {
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

          {/* Description is rich-text HTML from the admin editor; render it through
              the shared `.task-prose` renderer so formatting (headings, lists,
              bold, quotes) shows correctly instead of leaking raw tags. */}
          <RichTextContent
            html={description}
            className="text-zinc-700 [&_h2]:text-zinc-900 [&_h3]:text-zinc-900"
          />
        </div>
      </SiteContainer>
    </section>
  );
}
