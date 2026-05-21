"use client";

import { useId } from "react";
import { Check, Loader2, PenLine } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useStepNotes } from "@/lib/course-player/use-step-notes";

type Props = {
  stepId: string;
};

export function StepNotes({ stepId }: Props) {
  const { value, setValue, saveState } = useStepNotes(stepId);
  const labelId = useId();
  const hintId = useId();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          id={labelId}
          htmlFor={`notes-${stepId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
        >
          <PenLine className="size-4 text-[color:var(--player-accent)]" strokeWidth={2.4} />
          Catatan pribadi untuk materi ini
        </label>
        <SaveIndicator state={saveState} />
      </div>

      <Textarea
        id={`notes-${stepId}`}
        aria-labelledby={labelId}
        aria-describedby={hintId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tulis insight, pertanyaan, atau ringkasan singkat di sini…"
        className="min-h-[140px] resize-y rounded-2xl border-[color:var(--player-hairline)] bg-[color:var(--player-surface-strong)] px-4 py-3 leading-relaxed focus-visible:border-[color:var(--player-accent)]/60 focus-visible:ring-[color:var(--player-accent)]/30"
      />

      <p
        id={hintId}
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500"
      >
        Tersimpan otomatis di perangkat ini · belum disinkronkan ke akun
      </p>
    </div>
  );
}

function SaveIndicator({
  state,
}: {
  state: "idle" | "saving" | "saved";
}) {
  const label = state === "saving" ? "Menyimpan…" : state === "saved" ? "Tersimpan" : "Mulai mengetik";
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        state === "saved" && "text-[color:var(--player-accent)]",
        state === "saving" && "text-zinc-500",
        state === "idle" && "text-zinc-400",
      )}
    >
      {state === "saving" ? (
        <Loader2 className="size-3 animate-spin" strokeWidth={2.4} />
      ) : state === "saved" ? (
        <Check className="size-3" strokeWidth={3} />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}
