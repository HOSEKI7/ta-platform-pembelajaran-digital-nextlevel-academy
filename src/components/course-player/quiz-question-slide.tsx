"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlayerQuizQuestion } from "@/lib/course-player/types";

type Props = {
  question: PlayerQuizQuestion;
  index: number;
  total: number;
  selectedIndex: number | undefined;
  /** True iff every question in the quiz has an answer picked. */
  allAnswered: boolean;
  /** Per-question answered flag, indexed by slide position. */
  answeredByIndex: boolean[];
  isFirst: boolean;
  isLast: boolean;
  submitting: boolean;
  onSelect: (questionId: string, optionIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

/**
 * A single quiz question screen — one question + N option cards, with
 * prev/next navigation. The trailing slide swaps "Selanjutnya" for "Submit".
 *
 * Option rendering: a string is treated as an image if it matches a URL or
 * a root-relative path; otherwise text. Same convention as `question` vs
 * `questionImageUrl`. PRD §6.5.7 / §6.11.3.2 allows either.
 */
const IMAGE_PATTERN = /^(https?:\/\/|\/)/;

export function QuizQuestionSlide({
  question,
  index,
  total,
  selectedIndex,
  allAnswered,
  answeredByIndex,
  isFirst,
  isLast,
  submitting,
  onSelect,
  onPrev,
  onNext,
  onSubmit,
}: Props) {
  const submitDisabled = !allAnswered || submitting;

  return (
    <div className="relative flex h-full w-full flex-col gap-6 px-6 py-8 text-white sm:px-10 sm:py-10">
      {/* Decorative grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,214,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,214,0,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Header */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--player-accent-yellow)]/80">
            Soal {String(index + 1).padStart(2, "0")} dari {String(total).padStart(2, "0")}
          </p>
          <h3 className="text-balance text-lg font-semibold leading-snug text-white sm:text-xl">
            {question.question ?? "Perhatikan gambar berikut:"}
          </h3>
        </div>
        <ProgressDots
          total={total}
          activeIndex={index}
          answeredByIndex={answeredByIndex}
        />
      </div>

      {/* Question media */}
      {question.questionImageUrl ? (
        <div className="relative overflow-hidden rounded-xl ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.questionImageUrl}
            alt=""
            className="block max-h-72 w-full object-contain"
          />
        </div>
      ) : null}

      {/* Options */}
      <div role="radiogroup" aria-label="Pilihan jawaban" className="relative flex flex-1 flex-col gap-3">
        {question.options.map((opt, i) => {
          const checked = selectedIndex === i;
          const isImg = IMAGE_PATTERN.test(opt);
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSelect(question.id, i)}
              disabled={submitting}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1018]",
                checked
                  ? "border-[color:var(--player-accent)] bg-[color:var(--player-accent)]/12 shadow-[0_10px_30px_-12px_rgba(71,142,244,0.55)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
                submitting && "cursor-not-allowed opacity-60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  checked
                    ? "border-[color:var(--player-accent)] bg-[color:var(--player-accent)] text-white"
                    : "border-white/30 text-white/70",
                )}
              >
                {checked ? <CheckCircle2 className="size-3.5" strokeWidth={3} /> : String.fromCharCode(65 + i)}
              </span>
              {isImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opt} alt={`Pilihan ${String.fromCharCode(65 + i)}`} className="max-h-32 rounded-md object-contain" />
              ) : (
                <span className="text-sm text-white/90">{opt}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer nav */}
      <div className="relative flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst || submitting}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]",
            isFirst || submitting
              ? "cursor-not-allowed bg-white/[0.03] text-white/30 ring-white/5"
              : "bg-white/[0.04] text-white/75 ring-white/10 hover:bg-white/[0.08] hover:text-white",
          )}
        >
          <ArrowLeft className="size-4" strokeWidth={2.4} />
          Sebelumnya
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            title={!allAnswered ? "Jawab semua soal terlebih dahulu." : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent-yellow)]",
              submitDisabled
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-gradient-to-r from-[color:var(--player-accent)] to-[color:var(--player-accent-yellow)]/85 text-white shadow-[0_18px_40px_-18px_rgba(71,142,244,0.7)] hover:brightness-110",
            )}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2.6} />
            ) : (
              <Send className="size-4" strokeWidth={2.4} />
            )}
            Submit Jawaban
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--player-accent)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(71,142,244,0.65)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]"
          >
            Selanjutnya
            <ArrowRight className="size-4" strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}

function ProgressDots({
  total,
  activeIndex,
  answeredByIndex,
}: {
  total: number;
  activeIndex: number;
  answeredByIndex: boolean[];
}) {
  return (
    <div className="flex items-center gap-1.5" role="presentation" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === activeIndex;
        const isAnswered = answeredByIndex[i] ?? false;
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              isActive
                ? "w-6 bg-[color:var(--player-accent-yellow)]"
                : isAnswered
                  ? "w-2.5 bg-[color:var(--player-accent)]/80"
                  : "w-2 bg-white/15",
            )}
          />
        );
      })}
    </div>
  );
}
