"use client";

import { useState } from "react";
import { ArrowRight, Award, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { CompletionBurst } from "./completion-burst";

type Props = {
  isCompleted: boolean;
  isLast: boolean;
  /** True once every step in the course is completed (progress 100%). */
  courseCompleted: boolean;
  onComplete: () => void;
  onNext: () => void;
  /** Invoked from the final step once the course is 100% complete — routes the
   *  student to their certificate page to claim it. */
  onClaimCertificate: () => void;
  /** When true, the button is locked (e.g. quiz step that isn't passable yet). */
  disabled?: boolean;
  /** Mutation-in-flight indicator — disables click + swaps icon to a spinner. */
  loading?: boolean;
};

/**
 * The signature interaction of the Course Player: a single button that
 * morphs from "Tandai Selesai" into "Materi Selanjutnya →" once the active
 * step is completed. The morph crossfades the inner text spans while the
 * background eases from solid brand-blue into a blue → soft yellow gradient
 * (the "Focus Theater" signature).
 *
 * When the student finishes the FINAL step AND the whole course has reached
 * 100% completion, the button becomes the green "✅ Klaim Sertifikat" CTA that
 * routes to the certificate page. If the final step is done but earlier steps
 * are somehow still open, it falls back to a non-interactive "Kursus Selesai".
 */
export function CompleteButton({
  isCompleted,
  isLast,
  courseCompleted,
  onComplete,
  onNext,
  onClaimCertificate,
  disabled,
  loading,
}: Props) {
  const [burstShown, setBurstShown] = useState(false);
  const [prevIsCompleted, setPrevIsCompleted] = useState(isCompleted);

  // Reset the burst whenever the active step (and therefore completion state)
  // resets back to "Tandai Selesai". "Adjust state during render" pattern.
  if (isCompleted !== prevIsCompleted) {
    setPrevIsCompleted(isCompleted);
    if (!isCompleted) setBurstShown(false);
  }

  // Final step + 100% course progress → the button claims the certificate.
  const showClaim = isCompleted && isLast && courseCompleted;
  // Final step completed but course not fully done (edge case) → dead-end label.
  const isDeadEnd = isCompleted && isLast && !courseCompleted;

  function handleClick() {
    if (disabled || loading) return;
    if (!isCompleted) {
      setBurstShown(true);
      onComplete();
      // Burst auto-dismisses after the animation ends (matches keyframe).
      window.setTimeout(() => setBurstShown(false), 1100);
      return;
    }
    if (showClaim) {
      onClaimCertificate();
      return;
    }
    if (!isLast) onNext();
  }

  const label = !isCompleted
    ? "Tandai Selesai"
    : showClaim
      ? "Klaim Sertifikat"
      : isLast
        ? "Kursus Selesai"
        : "Materi Selanjutnya";

  return (
    <div className="relative inline-flex">
      <CompletionBurst show={burstShown} />

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading || isDeadEnd}
        aria-label={label}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-5 text-sm font-semibold text-white",
          "transition-[background,box-shadow,transform,width] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--player-stage)]",
          !isCompleted &&
            "bg-[color:var(--player-accent)] shadow-[0_18px_40px_-18px_rgba(71,142,244,0.65)] hover:brightness-110",
          isCompleted &&
            !isLast &&
            "bg-gradient-to-r from-[color:var(--player-accent)] via-[color:var(--player-accent)] to-[color:var(--player-accent-yellow)]/45 shadow-[0_22px_44px_-18px_rgba(71,142,244,0.75)] hover:brightness-110",
          showClaim &&
            "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_18px_40px_-18px_rgba(16,185,129,0.6)] hover:brightness-110",
          isDeadEnd &&
            "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_18px_40px_-18px_rgba(16,185,129,0.6)] cursor-default",
          (disabled || loading) && "opacity-70 cursor-not-allowed",
        )}
      >
        {/* Icon swap */}
        <span
          className="relative inline-flex size-5 items-center justify-center"
          aria-hidden
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.6} />
          ) : showClaim ? (
            <Award
              className="size-4"
              strokeWidth={2.8}
              style={{ animation: "player-morph-in 0.4s ease both" }}
            />
          ) : isCompleted ? (
            isLast ? (
              <Check className="size-4" strokeWidth={3} />
            ) : (
              <ArrowRight
                className="size-4"
                strokeWidth={2.8}
                style={{ animation: "player-morph-in 0.4s ease both" }}
              />
            )
          ) : (
            <Check className="size-4" strokeWidth={2.8} />
          )}
        </span>

        {/* Label crossfade */}
        <span
          key={label}
          className="relative"
          style={{ animation: "player-morph-in 0.4s ease both" }}
        >
          {label}
        </span>
      </button>

      {/* SR live-region announcement when status flips */}
      <span aria-live="polite" className="sr-only">
        {isCompleted
          ? showClaim
            ? "Selamat! Kursus tuntas. Klaim sertifikatmu."
            : isLast
              ? "Seluruh kursus ditandai selesai."
              : "Materi ditandai selesai. Lanjut ke materi berikutnya."
          : ""}
      </span>
    </div>
  );
}
