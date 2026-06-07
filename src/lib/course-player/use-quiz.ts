"use client";

import { useCallback, useReducer } from "react";

/**
 * Phases of a single quiz step session. Cooldown is computed OUTSIDE this
 * reducer (from `QuizStepState.cooldownUntil`) so a cooldown-expiring tick
 * doesn't need to dispatch — the runner just re-renders.
 */
export type QuizPhase =
  | { kind: "intro" }
  | { kind: "active"; index: number; answers: Map<string, number> }
  | { kind: "submitting"; index: number; answers: Map<string, number> }
  | {
      kind: "result";
      score: number;
      passed: boolean;
      expAwarded: number;
      correctCount: number;
      totalQuestions: number;
      attempts: number;
    };

export type QuizAction =
  | { kind: "start" }
  | { kind: "select"; questionId: string; optionIndex: number }
  | { kind: "nextSlide" }
  | { kind: "prevSlide" }
  | { kind: "submitStart" }
  | {
      kind: "submitSuccess";
      score: number;
      passed: boolean;
      expAwarded: number;
      correctCount: number;
      totalQuestions: number;
      attempts: number;
    }
  | { kind: "submitError" }
  | { kind: "retry" };

function reducer(state: QuizPhase, action: QuizAction): QuizPhase {
  switch (action.kind) {
    case "start":
      return { kind: "active", index: 0, answers: new Map() };

    case "select": {
      if (state.kind !== "active") return state;
      const next = new Map(state.answers);
      next.set(action.questionId, action.optionIndex);
      return { ...state, answers: next };
    }

    case "nextSlide":
      if (state.kind !== "active") return state;
      return { ...state, index: state.index + 1 };

    case "prevSlide":
      if (state.kind !== "active") return state;
      return { ...state, index: Math.max(0, state.index - 1) };

    case "submitStart":
      if (state.kind !== "active") return state;
      // Keep the current slide index so the submit slide stays put (spinner)
      // instead of flickering back to question 1 during the request.
      return { kind: "submitting", index: state.index, answers: state.answers };

    case "submitSuccess":
      return {
        kind: "result",
        score: action.score,
        passed: action.passed,
        expAwarded: action.expAwarded,
        correctCount: action.correctCount,
        totalQuestions: action.totalQuestions,
        attempts: action.attempts,
      };

    case "submitError":
      if (state.kind !== "submitting") return state;
      // Drop back to the active phase on the SAME slide, preserving entered
      // answers so the student can just retry the submit after a network blip
      // (no bounce back to question 1).
      return { kind: "active", index: state.index, answers: state.answers };

    case "retry":
      return { kind: "intro" };

    default:
      return state;
  }
}

export function useQuiz() {
  const [phase, dispatch] = useReducer(reducer, { kind: "intro" } as QuizPhase);

  const start = useCallback(() => dispatch({ kind: "start" }), []);
  const select = useCallback(
    (questionId: string, optionIndex: number) =>
      dispatch({ kind: "select", questionId, optionIndex }),
    [],
  );
  const nextSlide = useCallback(() => dispatch({ kind: "nextSlide" }), []);
  const prevSlide = useCallback(() => dispatch({ kind: "prevSlide" }), []);
  const submitStart = useCallback(() => dispatch({ kind: "submitStart" }), []);
  const submitSuccess = useCallback(
    (payload: Extract<QuizAction, { kind: "submitSuccess" }>) =>
      dispatch(payload),
    [],
  );
  const submitError = useCallback(() => dispatch({ kind: "submitError" }), []);
  const retry = useCallback(() => dispatch({ kind: "retry" }), []);

  return {
    phase,
    start,
    select,
    nextSlide,
    prevSlide,
    submitStart,
    submitSuccess,
    submitError,
    retry,
  } as const;
}
