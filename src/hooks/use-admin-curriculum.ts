"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

/**
 * Live CRUD for a course's curriculum (sprints + steps). Each mutation hits a
 * real API route and then `router.refresh()`-es so the server-rendered edit page
 * re-reads from `loadCourseForEdit` — single source of truth, no client cache to
 * keep in sync.
 */

export type StepVideoPayload = {
  type: "VIDEO";
  title: string;
  description: string;
  bunnyVideoId: string;
};

export type StepQuizQuestionPayload = {
  question: string;
  questionImageUrl: string | null;
  options: string[];
  answer: number;
};

export type StepQuizPayload = {
  type: "QUIZ";
  title: string;
  description: string;
  passingScore: number;
  questions: StepQuizQuestionPayload[];
};

export type StepPayload = StepVideoPayload | StepQuizPayload;

async function jsonFetch(url: string, method: string, body?: unknown): Promise<void> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const parsed = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(parsed?.error ?? `Permintaan gagal (${res.status}).`);
  }
}

export function useCurriculumActions(courseId: string) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const addSprint = useMutation({
    mutationFn: (title: string) =>
      jsonFetch(`/api/admin/courses/${courseId}/sprints`, "POST", { title }),
    onSuccess: refresh,
  });

  const renameSprint = useMutation({
    mutationFn: (vars: { sprintId: string; title: string }) =>
      jsonFetch(`/api/admin/sprints/${vars.sprintId}`, "PATCH", { title: vars.title }),
    onSuccess: refresh,
  });

  const deleteSprint = useMutation({
    mutationFn: (sprintId: string) => jsonFetch(`/api/admin/sprints/${sprintId}`, "DELETE"),
    onSuccess: refresh,
  });

  const addStep = useMutation({
    mutationFn: (vars: { sprintId: string; payload: StepPayload }) =>
      jsonFetch(`/api/admin/sprints/${vars.sprintId}/steps`, "POST", vars.payload),
    onSuccess: refresh,
  });

  const updateStep = useMutation({
    mutationFn: (vars: { stepId: string; payload: StepPayload }) =>
      jsonFetch(`/api/admin/steps/${vars.stepId}`, "PATCH", vars.payload),
    onSuccess: refresh,
  });

  const deleteStep = useMutation({
    mutationFn: (stepId: string) => jsonFetch(`/api/admin/steps/${stepId}`, "DELETE"),
    onSuccess: refresh,
  });

  return { addSprint, renameSprint, deleteSprint, addStep, updateStep, deleteStep };
}
