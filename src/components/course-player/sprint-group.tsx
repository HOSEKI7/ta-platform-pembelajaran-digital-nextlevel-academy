"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlayerSprint, StepStatus } from "@/lib/course-player/types";
import type { PlayerState } from "@/lib/course-player/use-player-state";
import { StepRow } from "./step-row";

type Props = {
  sprint: PlayerSprint;
  state: PlayerState;
  statusOf: (stepId: string) => StepStatus;
  onSelect: (stepId: string) => void;
  staggerIndex: number;
  baseStepIndex: number;
};

export function SprintGroup({
  sprint,
  state,
  statusOf,
  onSelect,
  staggerIndex,
  baseStepIndex,
}: Props) {
  const containsActive = sprint.steps.some((s) => s.id === state.activeStepId);
  const completedCount = sprint.steps.filter((s) => state.completedStepIds.has(s.id)).length;
  const total = sprint.steps.length;
  const ratio = total === 0 ? 0 : completedCount / total;
  const isFullyDone = completedCount === total;

  const [open, setOpen] = useState(containsActive || isFullyDone);
  const [prevContainsActive, setPrevContainsActive] = useState(containsActive);

  // React's "adjusting state during render" pattern: when the active step
  // moves into this sprint (e.g. via "Materi Selanjutnya"), pop it open even
  // if the user had collapsed it. Setting state during render is safe here
  // because it only runs when the prop derivation changes.
  if (containsActive !== prevContainsActive) {
    setPrevContainsActive(containsActive);
    if (containsActive) setOpen(true);
  }

  // SVG ring meter — 16 radius, 2 stroke. Circumference ≈ 100.5; we use 100.
  const C = 100;
  const dash = Math.round(ratio * C);

  return (
    <section
      className="opacity-0"
      style={{
        animation: `player-stagger 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) ${staggerIndex * 70}ms both`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "group/sprint flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition",
          "hover:bg-[color:var(--player-surface-strong)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]/50",
        )}
      >
        {/* Ring meter */}
        <span className="relative flex size-9 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="size-9 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-200/70 dark:text-white/10"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
              className={cn(
                "transition-all duration-700 ease-out",
                isFullyDone
                  ? "text-[color:var(--player-accent-yellow)]"
                  : "text-[color:var(--player-accent)]",
              )}
            />
          </svg>
          <span
            className={cn(
              "absolute font-mono text-[9px] font-semibold tracking-tighter",
              isFullyDone
                ? "text-[color:var(--player-accent-yellow)]"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {completedCount}/{total}
          </span>
        </span>

        {/* Title block */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
              Sprint {sprint.order}
            </span>
            {containsActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--player-accent)]/12 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--player-accent)] ring-1 ring-[color:var(--player-accent)]/25">
                Sedang
              </span>
            ) : null}
          </div>
          <h3 className="mt-0.5 truncate text-[13px] font-semibold leading-tight text-foreground">
            {sprint.title}
          </h3>
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-zinc-400 transition-transform duration-300 dark:text-zinc-500",
            open ? "rotate-0" : "-rotate-90",
          )}
          strokeWidth={2.2}
        />
      </button>

      {open ? (
        <ul role="list" className="mt-1 flex flex-col gap-0.5 pl-1">
          {sprint.steps.map((step, i) => (
            <StepRow
              key={step.id}
              step={step}
              status={statusOf(step.id)}
              index={baseStepIndex + i}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
