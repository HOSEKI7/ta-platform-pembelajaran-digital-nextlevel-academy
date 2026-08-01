"use client";

import { useId } from "react";
import { Check, Loader2, PenLine, TriangleAlert } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { CharCounter } from "@/components/ui/char-counter";
import { cn } from "@/lib/utils";
import { STEP_NOTE_MAX } from "@/lib/validations/step-note";
import {
  type NotesSaveState,
  useStepNotes,
} from "@/lib/course-player/use-step-notes";

type Props = {
  stepId: string;
  initialContent: string;
  onNoteSaved: (stepId: string, content: string) => void;
};

export function StepNotes({ stepId, initialContent, onNoteSaved }: Props) {
  const { value, setValue, saveState } = useStepNotes(
    stepId,
    initialContent,
    onNoteSaved,
  );
  const labelId = useId();
  const hintId = useId();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          id={labelId}
          htmlFor={`notes-${stepId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
        >
          <PenLine className="size-4 text-[color:var(--player-accent)]" strokeWidth={2.4} />
          Catatan pribadi untuk materi ini
        </label>
        <div className="flex items-center gap-3">
          <CharCounter current={value.length} max={STEP_NOTE_MAX} />
          <SaveIndicator state={saveState} />
        </div>
      </div>

      <Textarea
        id={`notes-${stepId}`}
        aria-labelledby={labelId}
        aria-describedby={hintId}
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, STEP_NOTE_MAX))}
        maxLength={STEP_NOTE_MAX}
        placeholder="Tulis insight, pertanyaan, atau ringkasan singkat di sini…"
        className="min-h-[140px] resize-y rounded-2xl border-[color:var(--player-hairline)] bg-[color:var(--player-surface-strong)] px-4 py-3 leading-relaxed focus-visible:border-[color:var(--player-accent)]/60 focus-visible:ring-[color:var(--player-accent)]/30"
      />

      <p
        id={hintId}
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500"
      >
        Tersimpan otomatis ke akun Anda · tersinkron di semua perangkat
      </p>
    </div>
  );
}

function SaveIndicator({ state }: { state: NotesSaveState }) {
  const label =
    state === "saving"
      ? "Menyimpan…"
      : state === "saved"
        ? "Tersimpan"
        : state === "error"
          ? "Gagal menyimpan"
          : "Mulai mengetik";
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        state === "saved" && "text-[color:var(--player-accent)]",
        state === "saving" && "text-zinc-500",
        state === "idle" && "text-zinc-400",
        state === "error" && "text-red-500",
      )}
    >
      {state === "saving" ? (
        <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
      ) : state === "saved" ? (
        <Check className="size-3" strokeWidth={3} />
      ) : state === "error" ? (
        <TriangleAlert className="size-3" strokeWidth={2.4} />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}
