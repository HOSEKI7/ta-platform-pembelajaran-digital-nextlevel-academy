import type { PlayerCourse, PlayerSprint, PlayerStep } from "./types";

export type FlatStep = PlayerStep & { sprintId: string; sprintTitle: string };

/**
 * Flattens sprint → step into a single ordered list. The Course Player's
 * "next step" resolution is just `flat[indexOf(active) + 1]`, which keeps
 * the navigation logic in `use-player-state` O(1) per dispatch.
 */
export function flattenSteps(course: PlayerCourse): FlatStep[] {
  const sorted = [...course.sprints].sort((a, b) => a.order - b.order);
  return sorted.flatMap((sprint: PlayerSprint) =>
    sprint.steps.map((step) => ({
      ...step,
      sprintId: sprint.id,
      sprintTitle: sprint.title,
    })),
  );
}

export function findStep(course: PlayerCourse, stepId: string): FlatStep | undefined {
  return flattenSteps(course).find((s) => s.id === stepId);
}

export function findNextStep(
  course: PlayerCourse,
  activeStepId: string,
): FlatStep | undefined {
  const flat = flattenSteps(course);
  const idx = flat.findIndex((s) => s.id === activeStepId);
  if (idx === -1 || idx === flat.length - 1) return undefined;
  return flat[idx + 1];
}
