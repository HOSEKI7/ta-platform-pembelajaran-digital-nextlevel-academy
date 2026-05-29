"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mentorKeys } from "@/hooks/use-mentor-attendance";

export type CreateTaskPayload = {
  title: string;
  /** Rich-text HTML from the editor. */
  description: string;
  /** Wall-clock WIB "yyyy-MM-ddTHH:mm" — server converts to UTC. */
  deadline: string;
  /** Optional supporting attachment (PDF/DOCX/ZIP). */
  file: File | null;
};

async function postTask(payload: CreateTaskPayload): Promise<{ id: string }> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("description", payload.description);
  fd.append("deadline", payload.deadline);
  if (payload.file) fd.append("file", payload.file);

  const res = await fetch("/api/mentor/tasks", { method: "POST", body: fd });
  const body = (await res.json().catch(() => null)) as
    | { data?: { id: string }; error?: string }
    | null;
  if (!res.ok || !body?.data) {
    throw new Error(body?.error ?? `Gagal membuat tugas (${res.status}).`);
  }
  return body.data;
}

/** Create a class task (multipart). Invalidates mentor-scoped client caches. */
export function useCreateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mentorKeys.all });
    },
  });
}
