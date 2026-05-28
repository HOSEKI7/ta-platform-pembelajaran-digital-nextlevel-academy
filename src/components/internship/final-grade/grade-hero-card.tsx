import { Award, CalendarClock, Hourglass, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TONE_ACCENT_TEXT,
  TONE_SURFACE,
  formatGradeDate,
  formatGradeDateTime,
  resolveGradeBand,
} from "@/components/internship/final-grade/final-grade-helpers";

type GradedProps = {
  kind: "graded";
  grade: number;
  gradedAtISO: string | null;
  lastUpdatedISO: string | null;
  mentorName: string;
  editorName: string | null;
};

type EmptyProps = {
  kind: "empty";
  mentorName: string;
};

type Props = GradedProps | EmptyProps;

/**
 * Hero scorecard. Editorial-typography led: the score number dominates, the
 * grade letter + predicate pita sit beside it. Empty state mirrors the same
 * shape but swaps the number for a dash placeholder and announces the wait.
 */
export function GradeHeroCard(props: Props) {
  if (props.kind === "empty") {
    return <EmptyHero mentorName={props.mentorName} />;
  }
  return (
    <GradedHero
      grade={props.grade}
      gradedAtISO={props.gradedAtISO}
      lastUpdatedISO={props.lastUpdatedISO}
      mentorName={props.mentorName}
      editorName={props.editorName}
    />
  );
}

// ---- Graded variant --------------------------------------------------------

function GradedHero({
  grade,
  gradedAtISO,
  lastUpdatedISO,
  mentorName,
  editorName,
}: Omit<GradedProps, "kind">) {
  const band = resolveGradeBand(grade);
  const issuedLabel = gradedAtISO ? formatGradeDate(gradedAtISO) : null;
  const lastUpdatedLabel = lastUpdatedISO ? formatGradeDateTime(lastUpdatedISO) : null;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white px-6 py-8 ring-1 ring-zinc-200 sm:px-10 sm:py-10",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      {/* Decorative accent band — band-tone surface bleeding off the top-right
          corner. Subtle, not flashy, anchors the colour language to the score. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -top-24 size-72 rounded-full opacity-60 blur-3xl",
          TONE_SURFACE[band.tone],
        )}
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
        {/* Left: score + letter */}
        <div className="grade-rise flex items-baseline gap-4 sm:gap-5">
          <p
            aria-label={`Nilai akhir ${grade} dari 100`}
            className={cn(
              "font-heading text-[7rem] font-extrabold leading-none tracking-tight text-zinc-900 tabular-nums sm:text-[9rem]",
              "dark:text-zinc-50",
            )}
          >
            {grade}
            <span className="ml-1 text-3xl font-semibold text-zinc-300 dark:text-zinc-600 sm:text-4xl">
              /100
            </span>
          </p>
          <div className="flex flex-col gap-2 pb-2">
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-2xl px-3 py-1.5 font-heading text-2xl font-bold ring-1 ring-inset sm:text-3xl",
                TONE_SURFACE[band.tone],
              )}
            >
              {band.letter}
            </span>
            <span className={cn("text-xs font-semibold uppercase tracking-[0.18em]", TONE_ACCENT_TEXT[band.tone])}>
              Predikat
            </span>
          </div>
        </div>

        {/* Right: predicate + meta */}
        <div className="grade-rise grade-rise-delay-1 flex flex-1 flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Hasil Akhir Magang
          </p>
          <h2 className="font-heading text-3xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {band.predicate}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-300/80">
            Nilai ini adalah evaluasi akhir mentor atas keseluruhan kontribusimu
            selama mengikuti program magang.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm text-zinc-600 dark:text-zinc-300/80">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
              <span>
                Diberikan oleh{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {mentorName}
                </span>
              </span>
            </span>
            {issuedLabel ? (
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="size-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                <span>{issuedLabel}</span>
              </span>
            ) : null}
          </div>

          {editorName ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Direvisi oleh{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                {editorName}
              </span>
              {lastUpdatedLabel ? <> pada {lastUpdatedLabel}</> : null}.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---- Empty variant ---------------------------------------------------------

function EmptyHero({ mentorName }: { mentorName: string }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white px-6 py-8 ring-1 ring-zinc-200 sm:px-10 sm:py-10",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
      aria-live="polite"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-zinc-100 opacity-60 blur-3xl dark:bg-white/[0.04]"
      />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
        <div className="grade-rise flex items-baseline gap-4 sm:gap-5">
          <p
            className={cn(
              "select-none font-heading text-[7rem] font-extrabold leading-none tracking-tight text-zinc-200 tabular-nums sm:text-[9rem]",
              "dark:text-white/10",
            )}
            aria-hidden
          >
            ——
          </p>
          <div className="flex flex-col gap-2 pb-2">
            <span className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-3 py-1.5 font-heading text-2xl font-bold text-zinc-400 ring-1 ring-inset ring-zinc-200 dark:bg-white/5 dark:text-zinc-600 dark:ring-white/10 sm:text-3xl">
              ?
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Predikat
            </span>
          </div>
        </div>

        <div className="grade-rise grade-rise-delay-1 flex flex-1 flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30">
            <Hourglass className="grade-empty-pulse size-3.5" strokeWidth={2.4} />
            Menunggu nilai akhir
          </span>
          <h2 className="font-heading text-3xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Mentormu belum memberikan nilai akhir
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-300/80">
            Nilai akhir akan diisi oleh mentor{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {mentorName}
            </span>{" "}
            di akhir periode magang. Setelah dirilis, kamu akan melihatnya di
            halaman ini lengkap dengan grade dan predikat.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-zinc-600 dark:text-zinc-300/80">
            <span className="inline-flex items-center gap-2">
              <Award className="size-4 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
              <span>Skala penilaian 0–100, integer.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
