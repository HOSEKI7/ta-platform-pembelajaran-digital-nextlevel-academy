import { ListVideo, Plus, PuzzleIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteContainer } from "@/components/public/site-container";

type Step = {
  id: string;
  title: string;
  type: "VIDEO" | "QUIZ";
  order: number;
};

type Sprint = {
  id: string;
  title: string;
  order: number;
  steps: Step[];
};

type Props = { sprints: Sprint[] };

export function CourseCurriculum({ sprints }: Props) {
  const totalSteps = sprints.reduce((acc, s) => acc + s.steps.length, 0);
  if (sprints.length === 0) return null;

  return (
    <section id="kurikulum" className="relative py-16 sm:py-20 scroll-mt-24">
      <SiteContainer>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              Kurikulum
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Materi kursus, sprint demi sprint.
            </h2>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
            <span className="text-[color:var(--color-brand-700)]">{sprints.length}</span> sprint ·{" "}
            <span className="text-[color:var(--color-brand-700)]">{totalSteps}</span> materi
          </div>
        </div>

        <Accordion className="mt-10 space-y-3" defaultValue={[`sprint-0`]}>
          {sprints.map((sprint, sIdx) => (
            <AccordionItem
              key={sprint.id}
              value={`sprint-${sIdx}`}
              className="overflow-hidden rounded-2xl border-0 bg-white ring-1 ring-zinc-200 transition has-[[data-panel-open]]:ring-[color:var(--color-brand-300)] has-[[data-panel-open]]:shadow-[0_24px_50px_-30px_rgba(35,65,137,0.35)]"
            >
              <AccordionTrigger className="group items-center gap-4 px-5 py-5 text-left hover:no-underline [&>[data-slot=accordion-trigger-icon]]:hidden">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-brand-50)] font-heading text-sm font-extrabold text-[color:var(--color-brand-800)] ring-1 ring-[color:var(--color-brand-100)] transition group-data-[panel-open]:bg-[color:var(--color-brand-500)] group-data-[panel-open]:text-white">
                  {String(sIdx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="font-heading text-base font-bold text-zinc-900">
                    {sprint.title}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {sprint.steps.length} materi
                  </div>
                </div>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] transition group-data-[panel-open]:bg-[color:var(--color-brand-500)] group-data-[panel-open]:text-white group-data-[panel-open]:ring-[color:var(--color-brand-500)]">
                  <Plus
                    className="size-4 transition-transform duration-300 group-data-[panel-open]:rotate-45"
                    strokeWidth={2.6}
                  />
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-0">
                <ol className="space-y-3 border-t border-zinc-100 pt-4">
                  {sprint.steps.map((step, stepIdx) => {
                    const Icon = step.type === "VIDEO" ? ListVideo : PuzzleIcon;
                    return (
                      <li
                        key={step.id}
                        className="flex items-center gap-4 rounded-xl bg-zinc-50/60 p-4 ring-1 ring-zinc-100"
                      >
                        <div className="flex shrink-0 flex-col items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[color:var(--color-brand-700)]">
                            {sIdx + 1}.{stepIdx + 1}
                          </span>
                          <span
                            className={
                              step.type === "VIDEO"
                                ? "grid size-8 place-items-center rounded-lg bg-[color:var(--color-brand-500)] text-white"
                                : "grid size-8 place-items-center rounded-lg bg-[color:var(--color-brand-accent)] text-[color:var(--color-brand-900)]"
                            }
                          >
                            <Icon className="size-4" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-heading text-sm font-bold text-zinc-900">
                              {step.title}
                            </h4>
                            <span
                              className={
                                step.type === "VIDEO"
                                  ? "rounded-full bg-[color:var(--color-brand-50)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-brand-700)]"
                                  : "rounded-full bg-[color:var(--color-brand-accent)]/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-brand-900)]"
                              }
                            >
                              {step.type === "VIDEO" ? "Video" : "Kuis"}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SiteContainer>
    </section>
  );
}
