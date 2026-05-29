"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mentorKeys } from "@/hooks/use-mentor-attendance";
import type { CreateTaskPayload } from "@/hooks/use-create-task";

export type AttachmentAction = "keep" | "remove" | "replace";

export type UpdateTaskPayload = CreateTaskPayload & {
  attachmentAction: AttachmentAction;
};

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

async function putTask(
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<{ id: string }> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("description", payload.description);
  fd.append("deadline", payload.deadline);
  fd.append("attachmentAction", payload.attachmentAction);
  if (payload.file) fd.append("file", payload.file);

  const res = await fetch(`/api/mentor/tasks/${taskId}`, {
    method: "PUT",
    body: fd,
  });
  const body = (await res.json().catch(() => null)) as
    | { data?: { id: string }; error?: string }
    | null;
  if (!res.ok || !body?.data) {
    throw new Error(body?.error ?? `Gagal menyimpan tugas (${res.status}).`);
  }
  return body.data;
}

/** Update an existing task (multipart, mirrors create). */
export function useUpdateTaskMutation(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => putTask(taskId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: mentorKeys.all }),
  });
}

/** Hard-delete a task (cascades submissions; server cleans up Bunny files). */
export function useDeleteTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/mentor/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await parseError(res, "Gagal menghapus tugas."));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mentorKeys.all }),
  });
}

/** Return a submitted assignment to the student with review notes. */
export function useReturnSubmissionMutation(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { studentId: string; feedbackText: string }) => {
      const res = await fetch(
        `/api/mentor/tasks/${taskId}/submissions/${vars.studentId}/return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedbackText: vars.feedbackText }),
        },
      );
      if (!res.ok)
        throw new Error(await parseError(res, "Gagal mengembalikan tugas."));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mentorKeys.all }),
  });
}
