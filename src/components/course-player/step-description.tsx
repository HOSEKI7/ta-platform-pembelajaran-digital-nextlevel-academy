"use client";

import { Award } from "lucide-react";

import type { PlayerCourse, PlayerStep } from "@/lib/course-player/types";

type Props = {
  step: PlayerStep;
  course: PlayerCourse;
};

export function StepDescription({ step, course }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
          {step.description}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <Pill label="Format" value={step.type === "QUIZ" ? "Kuis" : "Video"} />
          <Pill
            label="Durasi"
            value={`${Math.round(step.durationSec / 60)} menit`}
          />
          <Pill
            label="Reward"
            value={step.type === "QUIZ" ? "+90 XP (skor pertama)" : "+15 XP"}
          />
        </div>
      </div>

      {/* Instructor card */}
      <aside className="rounded-2xl border border-[color:var(--player-hairline)] bg-[color:var(--player-surface-strong)] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Pengajar
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--player-accent)] to-[color:var(--player-accent-yellow)] text-base font-bold text-white ring-2 ring-[color:var(--player-surface)]">
            {course.instructor.avatarInitials}
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-foreground">
              {course.instructor.name}
            </h4>
            <p className="truncate text-[11px] text-zinc-500">
              {course.instructor.role}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {course.instructor.bio}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--player-accent)]/10 px-2.5 py-1 text-[11px] font-medium text-[color:var(--player-accent)] ring-1 ring-[color:var(--player-accent)]/20">
          <Award className="size-3.5" strokeWidth={2.4} />
          Verified Mentor
        </div>
      </aside>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--player-hairline)] bg-[color:var(--player-surface-strong)] px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
