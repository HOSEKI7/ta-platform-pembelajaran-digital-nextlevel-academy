"use client";

import { Brain, CheckCircle2, Hourglass, RotateCcw, Sparkles, Target } from "lucide-react";

import type { QuizStepState } from "@/lib/course-player/types";

type Props = {
  title: string;
  passingScore: number;
  totalQuestions: number;
  state: QuizStepState;
  /** Max attempts per window — same business constant as the server. */
  maxAttempts: number;
  onStart: () => void;
};

export function QuizIntro({
  title,
  passingScore,
  totalQuestions,
  state,
  maxAttempts,
  onStart,
}: Props) {
  const attemptsLeft = Math.max(0, maxAttempts - state.attempts);
  const cta = state.isPassed
    ? "Ulangi untuk Review"
    : state.attempts > 0
      ? "Coba Lagi"
      : "Mulai Kuis";

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 px-6 py-10 text-center text-white">
      {/* Decorative grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,214,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,214,0,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-[20%] top-[18%] -z-0 h-32 rounded-full bg-[color:var(--player-accent-yellow)]/15 blur-3xl"
      />

      <span className="relative flex size-16 items-center justify-center rounded-full bg-[color:var(--player-accent-yellow)]/15 ring-1 ring-[color:var(--player-accent-yellow)]/30">
        <Brain className="size-7 text-[color:var(--player-accent-yellow)]" strokeWidth={2.2} />
      </span>

      <div className="relative max-w-lg space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--player-accent-yellow)]/80">
          Kuis Materi
        </p>
        <h3 className="text-balance text-2xl font-semibold text-white sm:text-[26px]">
          {title}
        </h3>
        <p className="text-pretty text-sm text-white/65">
          Jawab {totalQuestions} soal pilihan ganda. Tidak ada batas waktu —
          kerjakan dengan tenang.
        </p>
      </div>

      {/* Rule chips */}
      <div className="relative flex flex-wrap items-center justify-center gap-2">
        <RuleChip icon={<Target className="size-3.5" />} label={`Skor lulus ${passingScore}`} />
        <RuleChip
          icon={<RotateCcw className="size-3.5" />}
          label={`${attemptsLeft} dari ${maxAttempts} percobaan tersisa`}
          tone={attemptsLeft === 0 ? "warn" : "default"}
        />
        <RuleChip icon={<Hourglass className="size-3.5" />} label="Cooldown 30 mnt" />
      </div>

      {state.isPassed ? (
        <div className="relative inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="size-3.5" strokeWidth={2.6} />
          Sudah lulus · Boleh review tanpa EXP tambahan
        </div>
      ) : state.lastScore !== null ? (
        <p className="relative text-xs text-white/55">
          Skor percobaan terakhir:{" "}
          <span className="font-semibold text-white">{state.lastScore}/100</span>
        </p>
      ) : null}

      <button
        type="button"
        onClick={onStart}
        className="relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-[color:var(--player-accent)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(71,142,244,0.65)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1018]"
      >
        <Sparkles className="size-4" strokeWidth={2.4} />
        {cta}
      </button>
    </div>
  );
}

function RuleChip({
  icon,
  label,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "default" | "warn";
}) {
  const toneCls =
    tone === "warn"
      ? "bg-amber-500/10 text-amber-200 ring-amber-500/30"
      : "bg-white/5 text-white/75 ring-white/10";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ring-1 ${toneCls}`}
    >
      {icon}
      {label}
    </span>
  );
}
