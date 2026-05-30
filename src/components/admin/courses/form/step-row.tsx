"use client";

import { ListChecks, Loader2, Pencil, Trash2, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StepDTO, VideoStatusValue } from "@/lib/admin-course-form-types";

const VIDEO_STATUS_META: Record<VideoStatusValue, { label: string; className: string }> = {
  PROCESSING: {
    label: "Memproses…",
    className: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  },
  READY: {
    label: "Siap",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  FAILED: {
    label: "Gagal",
    className: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  },
};

function fmtDuration(sec: number): string {
  if (!sec || sec <= 0) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  step: StepDTO;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
};

export function StepRow({ step, onEdit, onDelete, deleting }: Props) {
  const isVideo = step.type === "VIDEO";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 transition hover:border-zinc-300 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)] dark:hover:border-white/20">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg ring-1",
          isVideo
            ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30"
            : "bg-violet-50 text-violet-600 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30",
        )}
      >
        {isVideo ? (
          <Video className="size-4" strokeWidth={2.2} />
        ) : (
          <ListChecks className="size-4" strokeWidth={2.2} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {step.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {isVideo ? (
            <>
              {step.video ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                    VIDEO_STATUS_META[step.video.status].className,
                  )}
                >
                  {step.video.status === "PROCESSING" ? (
                    <Loader2 className="size-3 animate-spin" strokeWidth={2.6} />
                  ) : null}
                  {VIDEO_STATUS_META[step.video.status].label}
                </span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                  Tanpa video
                </span>
              )}
              {step.video && fmtDuration(step.video.duration) ? (
                <span className="tabular-nums">{fmtDuration(step.video.duration)}</span>
              ) : null}
            </>
          ) : (
            <span>
              {step.questions.length} soal · lulus ≥ {step.passingScore}
            </span>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onEdit}
        aria-label="Edit tahap"
        className="shrink-0 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"
      >
        <Pencil className="size-4" strokeWidth={2.2} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={deleting}
        onClick={onDelete}
        aria-label="Hapus tahap"
        className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
        ) : (
          <Trash2 className="size-4" strokeWidth={2.2} />
        )}
      </Button>
    </div>
  );
}
