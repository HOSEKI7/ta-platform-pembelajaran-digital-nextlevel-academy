"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileVideo, Loader2, RotateCcw, UploadCloud, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoUploadState } from "@/hooks/use-video-upload";

const ACCEPT = "video/mp4,video/webm";

type Props = {
  state: VideoUploadState;
  /** Existing video already saved (edit mode) — shown when idle. */
  existingLabel?: string;
  onPick: (file: File) => void;
  onReset: () => void;
  disabled?: boolean;
};

/**
 * Drag/drop video picker with TUS upload progress. The actual upload is driven
 * by `useVideoUpload`; this is the presentational shell that reports phases.
 */
export function VideoUploader({ state, existingLabel, onPick, onReset, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  if (state.phase === "uploading" || state.phase === "preparing") {
    const pct = state.phase === "uploading" ? Math.round(state.progress * 100) : 0;
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
            <Loader2 className="size-5 animate-spin" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {state.phase === "preparing" ? "Menyiapkan unggahan…" : "Mengunggah ke Bunny…"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Jangan tutup dialog sampai selesai.
            </p>
          </div>
          <span className="text-sm font-bold tabular-nums text-[color:var(--color-brand-600)] dark:text-[color:var(--color-brand-300)]">
            {pct}%
          </span>
        </div>
        <Progress value={pct} />
      </div>
    );
  }

  if (state.phase === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/[0.08]">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
          <CheckCircle2 className="size-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Video terunggah
          </p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Bunny akan memproses (encoding) di latar belakang.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onReset}>
          <RotateCcw className="size-3.5" strokeWidth={2.4} />
          Ganti
        </Button>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-500/30 dark:bg-red-500/[0.08]">
        <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
          <XCircle className="size-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">Unggahan gagal</p>
          <p className="truncate text-xs text-red-700/80 dark:text-red-300/80">{state.message}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onReset}>
          Coba lagi
        </Button>
      </div>
    );
  }

  // idle
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
          dragging
            ? "border-[color:var(--color-brand-400)] bg-[color:var(--color-brand-50)]/50"
            : "border-zinc-300 bg-zinc-50/60 hover:border-[color:var(--color-brand-400)] dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]",
        )}
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
          <UploadCloud className="size-5" strokeWidth={2.2} />
        </span>
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Tarik video ke sini atau klik untuk memilih
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">MP4 / WebM · maks 500 MB</span>
      </button>
      {existingLabel ? (
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <FileVideo className="size-3.5" strokeWidth={2.2} />
          Video saat ini: <span className="font-medium">{existingLabel}</span> — pilih file baru untuk
          menggantinya.
        </p>
      ) : null}
    </div>
  );
}
