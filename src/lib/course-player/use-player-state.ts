"use client";

import { useCallback, useEffect, useReducer } from "react";

import { findNextStep, flattenSteps } from "./flatten";
import type { PlayerCourse, StepStatus } from "./types";

export type PlayerState = {
  activeStepId: string;
  completedStepIds: Set<string>;
};

export type PlayerAction =
  | { kind: "select"; stepId: string }
  | { kind: "complete"; stepId: string }
  | { kind: "hydrate"; completedStepIds: Set<string> };

/** Pure reducer — no closure over `course`, so it satisfies React's rule
 *  against passing refs into reducers (and is trivial to reason about). */
function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.kind) {
    case "select":
      return { ...state, activeStepId: action.stepId };
    case "complete": {
      const next = new Set(state.completedStepIds);
      next.add(action.stepId);
      return { ...state, completedStepIds: next };
    }
    case "hydrate": {
      // Replace, not merge — server is the source of truth for completion.
      return { ...state, completedStepIds: new Set(action.completedStepIds) };
    }
    default:
      return state;
  }
}

type InitArgs = { course: PlayerCourse; completedStepIds: string[] };

function initialState({ course, completedStepIds }: InitArgs): PlayerState {
  const seeded = new Set(completedStepIds);
  const flat = flattenSteps(course);
  const firstUncompleted = flat.find((s) => !seeded.has(s.id));
  return {
    activeStepId: firstUncompleted?.id ?? flat[flat.length - 1].id,
    completedStepIds: seeded,
  };
}

export function statusOf(
  stepId: string,
  state: PlayerState,
  course: PlayerCourse,
): StepStatus {
  if (state.completedStepIds.has(stepId)) return "completed";
  if (state.activeStepId === stepId) return "active";

  // "Available" means: every step before this one is either completed OR
  // the currently-active one. Otherwise locked.
  const flat = flattenSteps(course);
  for (const step of flat) {
    if (step.id === stepId) return "available";
    if (state.completedStepIds.has(step.id)) continue;
    if (step.id === state.activeStepId) continue;
    return "locked";
  }
  return "available";
}

export function usePlayerState(args: InitArgs) {
  const { course } = args;
  const [state, dispatch] = useReducer(reducer, args, initialState);

  // URL hash sync: write the active step id so the page can be deep-linked.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetHash = `#step=${state.activeStepId}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${targetHash}`,
      );
    }
  }, [state.activeStepId]);

  // Read hash on first mount and select that step if it exists.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const match = hash.match(/^#step=([\w-]+)$/);
    if (!match) return;
    const candidate = match[1];
    const exists = flattenSteps(course).some((s) => s.id === candidate);
    if (exists) dispatch({ kind: "select", stepId: candidate });
    // We only want this on mount per-slug — re-running on every course
    // reference change would clobber user navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.slug]);

  const select = useCallback((stepId: string) => dispatch({ kind: "select", stepId }), []);
  const complete = useCallback(
    (stepId: string) => dispatch({ kind: "complete", stepId }),
    [],
  );
  const hydrate = useCallback(
    (completedStepIds: Set<string>) =>
      dispatch({ kind: "hydrate", completedStepIds }),
    [],
  );
  const goNext = useCallback(() => {
    const upcoming = findNextStep(course, state.activeStepId);
    if (!upcoming) return;
    dispatch({ kind: "select", stepId: upcoming.id });
  }, [course, state.activeStepId]);

  return { state, select, complete, hydrate, goNext } as const;
}
