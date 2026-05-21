"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "nla:player:notes:";

const storageKey = (stepId: string) => `${STORAGE_PREFIX}${stepId}`;

/**
 * Per-step notes textarea state, persisted to `localStorage`. Hydration-safe:
 * initial render is always empty string, then we sync from localStorage in an
 * effect. Writes are debounced 400ms so rapid typing isn't ratelimited.
 *
 * Returns: [value, setValue, saveState] where saveState is one of
 * "idle" (no pending write) | "saving" (debounce window) | "saved" (flushed).
 */
export type NotesSaveState = "idle" | "saving" | "saved";

export function useStepNotes(stepId: string) {
  const [value, setValueState] = useState("");
  const [saveState, setSaveState] = useState<NotesSaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIdRef = useRef(stepId);

  // Sync from localStorage when the active step changes. This effect
  // legitimately bridges React state with an external system (Web Storage),
  // matching the pattern used in `src/hooks/use-mobile.ts`.
  useEffect(() => {
    stepIdRef.current = stepId;
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey(stepId));
      // External-sync setState (matches the precedent in `src/hooks/use-mobile.ts`).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValueState(stored ?? "");
      setSaveState("idle");
    } catch {
      // Storage unavailable (private mode, quota) — fall back to empty.
      setValueState("");
    }
  }, [stepId]);

  const setValue = useCallback((next: string) => {
    setValueState(next);
    setSaveState("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey(stepIdRef.current), next);
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { value, setValue, saveState } as const;
}
