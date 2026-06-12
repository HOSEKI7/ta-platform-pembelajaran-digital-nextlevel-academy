"use client";

import { Brain, CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlayerStep, StepStatus } from "@/lib/course-player/types";

type Props = {
  step: PlayerStep;
  status: StepStatus;
  index: number;
  onSelect: (stepId: string) => void;
};

function durationLabel(sec: number): string {
  const minutes = Math.round(sec / 60);
  return `${minutes} mnt`;
}

export function StepRow({ step, status, index, onSelect }: Props) {
  const isLocked = status === "locked";
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const isQuiz = step.type === "QUIZ";

  return (
    <li className="relative">
      {/* Active accent rail — sits flush against the sidebar's inner padding. */}
      {isActive ? (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-[color:var(--player-accent)]"
          style={{ animation: "player-rail-pulse 2.4s ease-in-out infinite" }}
        />
      ) : null}

      <button
        type="button"
        disabled={isLocked}
        onClick={() => onSelect(step.id)}
        aria-current={isActive ? "step" : undefined}
        title={isLocked ? "Selesaikan materi sebelumnya untuk membuka." : step.title}
        className={cn(
          "group/step relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--player-surface)]",
          isActive
            ? "bg-[color:var(--player-glow-soft)] ring-1 ring-[color:var(--player-glow)]"
            : "hover:bg-[color:var(--player-surface-strong)]",
          isLocked && "cursor-not-allowed opacity-55 hover:bg-transparent",
        )}
      >
        {/* status icon */}
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            isCompleted && "bg-[color:var(--player-accent)]/15 text-[color:var(--player-accent)]",
            isActive && "bg-[color:var(--player-accent)]/20 text-[color:var(--player-accent)]",
            status === "available" && "bg-zinc-200/60 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
            isLocked && "bg-zinc-200/40 text-zinc-400 dark:bg-white/[0.04] dark:text-zinc-500",
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-4" strokeWidth={2.4} />
          ) : isActive ? (
            <PlayCircle className="size-4" strokeWidth={2.2} />
          ) : isLocked ? (
            <Lock className="size-3.5" strokeWidth={2.4} />
          ) : (
            <Circle className="size-3.5" strokeWidth={2.2} />
          )}
        </span>

        {/* text block */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.18em]",
                isActive ? "text-[color:var(--player-accent)]" : "text-zinc-400 dark:text-zinc-500",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4
              className={cn(
                "truncate text-sm font-medium leading-tight",
                isCompleted && "text-zinc-500 dark:text-zinc-400",
                isActive && "text-foreground",
                !isCompleted && !isActive && "text-zinc-700 dark:text-zinc-200",
                isLocked && "text-zinc-500 dark:text-zinc-500",
              )}
            >
              {step.title}
            </h4>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
            <span>{isQuiz ? "Kuis" : "Video"}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="font-mono">
              {isQuiz
                ? `${step.quiz?.questions.length ?? 0} soal`
                : durationLabel(step.durationSec)}
            </span>
          </div>
        </div>

        {/* quiz overlay icon — sits in the top-right corner */}
        {isQuiz ? (
          <span
            aria-hidden
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--player-accent-yellow)]/15 text-[color:var(--player-accent-yellow)] ring-1 ring-[color:var(--player-accent-yellow)]/30",
              isLocked && "opacity-60",
            )}
          >
            <Brain className="size-3.5" strokeWidth={2.4} />
          </span>
        ) : null}
      </button>
    </li>
  );
}
