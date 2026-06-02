"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

/**
 * Per-step personal notes (Course Player "Catatan" tab), persisted to the
 * student's account via `POST /api/learn/[stepId]/notes`.
 *
 * Performance: writes are **debounced 1.5s after typing stops** (never per
 * keystroke). Pending edits are flushed immediately — via `sendBeacon` — when
 * the active step changes, the component unmounts (leaving the tab), or the
 * page is hidden/closed, so nothing is lost without spamming the server.
 *
 * Initial content is hydrated server-side by the loader (`initialContent`), so
 * there is no client fetch on open.
 *
 * `saveState`: "idle" (no pending write) | "saving" (debounce window or
 * in-flight) | "saved" (persisted) | "error" (last save failed).
 */
export type NotesSaveState = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 1500;

/** Best-effort synchronous save used on unmount / page-hide (keepalive path). */
function beaconSave(stepId: string, content: string): void {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  try {
    const blob = new Blob([JSON.stringify({ content })], {
      type: "application/json",
    });
    navigator.sendBeacon(`/api/learn/${stepId}/notes`, blob);
  } catch {
    // Best-effort — nothing more we can do while the page is going away.
  }
}

export function useStepNotes(stepId: string, initialContent: string) {
  const [value, setValueState] = useState(initialContent);
  const [saveState, setSaveState] = useState<NotesSaveState>("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(initialContent); // latest typed value
  const savedValueRef = useRef(initialContent); // last value known persisted
  const stepIdRef = useRef(stepId);

  const { mutate } = useMutation<void, Error, { stepId: string; content: string }>({
    mutationFn: async ({ stepId: sid, content }) => {
      const res = await fetch(`/api/learn/${sid}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? "Gagal menyimpan catatan.");
      }
    },
    onSuccess: (_data, { stepId: savedStepId, content }) => {
      if (stepIdRef.current !== savedStepId) return; // moved on already
      savedValueRef.current = content;
      // Only flip to "saved" when nothing newer is pending.
      if (valueRef.current === content) setSaveState("saved");
    },
    onError: () => setSaveState("error"),
  });

  const setValue = useCallback(
    (next: string) => {
      setValueState(next);
      valueRef.current = next;

      if (timerRef.current) clearTimeout(timerRef.current);

      // No-op when typed back to the persisted value — skip the round-trip.
      if (next === savedValueRef.current) {
        timerRef.current = null;
        setSaveState(next.length === 0 ? "idle" : "saved");
        return;
      }

      setSaveState("saving");
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        mutate({ stepId: stepIdRef.current, content: valueRef.current });
      }, DEBOUNCE_MS);
    },
    [mutate],
  );

  // Active step changed (when this hook instance persists across steps): flush
  // the previous step's pending edit, then load the new step's server value.
  useEffect(() => {
    const prevStepId = stepIdRef.current;
    if (prevStepId !== stepId) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (valueRef.current !== savedValueRef.current) {
        beaconSave(prevStepId, valueRef.current);
      }
    }
    stepIdRef.current = stepId;
    valueRef.current = initialContent;
    savedValueRef.current = initialContent;
    // External-sync setState: bridging server-provided content into state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValueState(initialContent);
    setSaveState("idle");
  }, [stepId, initialContent]);

  // Flush pending edits on unmount (e.g. leaving the Catatan tab) and when the
  // page is hidden/closed — debounce can't fire in those windows.
  useEffect(() => {
    const flush = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (valueRef.current !== savedValueRef.current) {
        beaconSave(stepIdRef.current, valueRef.current);
        savedValueRef.current = valueRef.current;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, []);

  return { value, setValue, saveState } as const;
}
