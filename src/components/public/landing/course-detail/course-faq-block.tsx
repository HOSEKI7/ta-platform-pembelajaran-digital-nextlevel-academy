import { Plus } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteContainer } from "@/components/public/site-container";

type Faq = { id: string; question: string; answer: string; order: number };

type Props = { faqs: Faq[] };

export function CourseFaqBlock({ faqs }: Props) {
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="relative py-16 sm:py-20 scroll-mt-24">
      <SiteContainer>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              FAQ Kursus
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Pertanyaan paling sering soal kursus ini.
            </h2>
          </div>

          <Accordion className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.id}
                value={`faq-${i}`}
                className="overflow-hidden rounded-2xl border-0 bg-white ring-1 ring-zinc-200 transition has-[[data-panel-open]]:ring-[color:var(--color-brand-300)] has-[[data-panel-open]]:shadow-[0_24px_50px_-30px_rgba(35,65,137,0.35)]"
              >
                <AccordionTrigger className="group items-center gap-4 px-5 py-5 text-left text-base font-bold text-zinc-900 hover:no-underline [&>[data-slot=accordion-trigger-icon]]:hidden">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] transition group-data-[panel-open]:bg-[color:var(--color-brand-500)] group-data-[panel-open]:text-white group-data-[panel-open]:ring-[color:var(--color-brand-500)]">
                    <Plus
                      className="size-4 transition-transform duration-300 group-data-[panel-open]:rotate-45"
                      strokeWidth={2.6}
                    />
                  </span>
                  <span className="flex-1">{f.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-[68px] pr-5 pb-5 text-sm leading-relaxed text-zinc-600">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SiteContainer>
    </section>
  );
}
