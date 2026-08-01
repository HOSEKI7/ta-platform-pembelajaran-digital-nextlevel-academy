import * as React from "react";
import { cn } from "@/lib/utils";

export interface CharCounterProps {
  current: number;
  max: number;
  className?: string;
  showWarningLabel?: boolean;
}

/**
 * Reusable character counter for forms.
 * Shows `current / max` with visual color states:
 * - < 90%: muted text
 * - >= 90% & < 100%: warning amber
 * - >= 100%: error red + optional warning text
 */
export function CharCounter({
  current,
  max,
  className,
  showWarningLabel = true,
}: CharCounterProps) {
  const isMaxReached = current >= max;
  const isNearMax = current >= Math.floor(max * 0.9) && !isMaxReached;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-mono transition-colors",
        isMaxReached
          ? "font-semibold text-red-600 dark:text-red-400"
          : isNearMax
          ? "font-medium text-amber-600 dark:text-amber-400"
          : "text-zinc-400 dark:text-zinc-500",
        className
      )}
    >
      <span>
        {current}/{max}
      </span>
      {isMaxReached && showWarningLabel ? (
        <span className="font-sans font-medium text-[11px] text-red-500 dark:text-red-400">
          (Maksimal tercapai)
        </span>
      ) : null}
    </div>
  );
}
