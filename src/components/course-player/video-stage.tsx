"use client";

import { Brain, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlayerStep } from "@/lib/course-player/types";
import { CompleteButton } from "./complete-button";

type Props = {
  step: PlayerStep;
  sprintTitle: string;
  isCompleted: boolean;
  isLast: boolean;
  onComplete: () => void;
  onNext: () => void;
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VideoStage({
  step,
  sprintTitle,
  isCompleted,
  isLast,
  onComplete,
  onNext,
}: Props) {
  const isQuiz = step.type === "QUIZ";

  return (
    <section
      aria-label={isQuiz ? "Materi kuis" : "Pemutar video"}
      className="relative"
    >
      {/* Halo wash behind the frame — only the top third lights up. */}
      <div
        aria-hidden
        className="player-halo pointer-events-none absolute inset-x-[-10%] -top-12 -z-10 h-[280px]"
      />

      {/* Frame */}
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-[color:var(--player-hairline-strong)]",
          "bg-gradient-to-br from-[#0e1018] via-[#0a0c12] to-[#0e1018]",
          "shadow-[0_40px_120px_-40px_rgba(71,142,244,0.28)]",
        )}
      >
        {isQuiz ? (
          <QuizPlaceholder title={step.title} />
        ) : (
          <VideoPlaceholder title={step.title} duration={formatDuration(step.durationSec)} />
        )}

        {/* Top-left chip indicating type + sprint, glassmorphism over the frame. */}
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-md ring-1 ring-white/10">
          <span className="size-1.5 rounded-full bg-[color:var(--player-accent)]" />
          {sprintTitle}
        </div>
      </div>

      {/* Meta strip */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            {isQuiz ? "Kuis materi" : "Materi sekarang"} ·{" "}
            <span className="text-[color:var(--player-accent)]">{sprintTitle}</span>
          </p>
          <h1 className="mt-2 text-balance text-2xl font-semibold leading-tight text-foreground sm:text-[28px]">
            {step.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span>{formatDuration(step.durationSec)} menit</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>{isQuiz ? "Skor lulus 80/100" : "+15 XP saat selesai"}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CompleteButton
            isCompleted={isCompleted}
            isLast={isLast}
            onComplete={onComplete}
            onNext={onNext}
          />
        </div>
      </div>
    </section>
  );
}

function VideoPlaceholder({ title, duration }: { title: string; duration: string }) {
  return (
    <div className="relative h-full w-full">
      {/* Decorative grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Center stack */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
        <button
          type="button"
          aria-label={`Putar: ${title}`}
          className="group/play relative flex size-20 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15 backdrop-blur-sm transition hover:scale-105 hover:bg-white/12"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 0 0 rgba(71, 142, 244, 0.55)",
              animation: "auth-pulse-ring 2.6s ease-out infinite",
            }}
          />
          <Play className="size-7 translate-x-0.5 text-white" strokeWidth={2.2} />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
          Placeholder video · Bunny.net menyusul
        </span>
      </div>
      {/* Bottom-right time chip */}
      <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/10">
        {duration}
      </div>
    </div>
  );
}

function QuizPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center text-white">
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
      <div role="status" className="relative flex flex-col items-center gap-3">
        <span className="flex size-16 items-center justify-center rounded-full bg-[color:var(--player-accent-yellow)]/15 ring-1 ring-[color:var(--player-accent-yellow)]/30">
          <Brain className="size-7 text-[color:var(--player-accent-yellow)]" strokeWidth={2.2} />
        </span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm text-white/60">
          Komponen kuis akan menyusul di iterasi berikutnya. Pada versi final
          kamu akan menjawab soal pilihan ganda satu per satu — butuh skor ≥
          80 untuk lulus.
        </p>
        <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--player-accent-yellow)]/70">
          Skor lulus 80 · 3 percobaan
        </span>
      </div>
    </div>
  );
}
