"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { flattenSteps } from "@/lib/course-player/flatten";
import type { PlayerCourse, StepStatus } from "@/lib/course-player/types";
import type { PlayerState } from "@/lib/course-player/use-player-state";
import { SprintGroup } from "./sprint-group";

type Props = {
  course: PlayerCourse;
  state: PlayerState;
  statusOf: (stepId: string) => StepStatus;
  onSelect: (stepId: string) => void;
  variant?: "desktop" | "drawer";
  className?: string;
};

export function CurriculumSidebar({
  course,
  state,
  statusOf,
  onSelect,
  variant = "desktop",
  className,
}: Props) {
  const flat = flattenSteps(course);
  const totalSteps = flat.length;
  const completedSteps = flat.filter((s) => state.completedStepIds.has(s.id)).length;
  const ratio = totalSteps === 0 ? 0 : completedSteps / totalSteps;
  const pct = Math.round(ratio * 100);

  // SVG ring — radius 26, stroke 4 → circumference ≈ 163.36; use 163.
  const C = 163;
  const dash = Math.round(ratio * C);

  // Step base-index per sprint for the "01, 02, 03…" numbering across the
  // whole course. Computed up-front so the JSX map below stays pure.
  const sprintBaseIndices: number[] = [];
  course.sprints.reduce((acc, sprint) => {
    sprintBaseIndices.push(acc);
    return acc + sprint.steps.length;
  }, 0);

  return (
    <aside
      aria-label="Daftar materi kursus"
      className={cn(
        "flex flex-col overflow-hidden",
        variant === "desktop" &&
          "sticky top-[76px] max-h-[calc(100vh-88px)] rounded-2xl border border-[color:var(--player-hairline)] bg-[color:var(--player-surface)]",
        variant === "drawer" && "h-full",
        className,
      )}
    >
      {/* Header */}
      <div className="player-dot-grid relative border-b border-[color:var(--player-hairline)] px-5 pb-5 pt-5">
        <div className="flex items-start gap-4">
          {/* Big progress ring */}
          <div className="relative flex size-16 shrink-0 items-center justify-center">
            <svg viewBox="0 0 60 60" className="size-16 -rotate-90">
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-zinc-200/70 dark:text-white/10"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${C}`}
                className="text-[color:var(--player-accent)] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
              <span className="font-mono text-base font-semibold text-foreground">{pct}</span>
              <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-500">
                persen
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
              Kurikulum · {course.category}
            </p>
            <h2 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
              {course.title}
            </h2>
            <p className="mt-2 font-mono text-[11px] text-zinc-500">
              {completedSteps} dari {totalSteps} materi
            </p>
          </div>
        </div>

        {/* EXP placeholder chip — backend will replace this with real numbers later. */}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--player-accent-yellow)]/12 px-2.5 py-1 text-[11px] font-semibold text-[#9a8200] ring-1 ring-[color:var(--player-accent-yellow)]/30 dark:text-[color:var(--player-accent-yellow)]">
          <Sparkles className="size-3" strokeWidth={2.6} />
          +600 XP saat course tuntas
        </div>
      </div>

      {/* Sprint list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-2">
          {course.sprints.map((sprint, i) => (
            <SprintGroup
              key={sprint.id}
              sprint={sprint}
              state={state}
              statusOf={statusOf}
              onSelect={onSelect}
              staggerIndex={i}
              baseStepIndex={sprintBaseIndices[i]}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
