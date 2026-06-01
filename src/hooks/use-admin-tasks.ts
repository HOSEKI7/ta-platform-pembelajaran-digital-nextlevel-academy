"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ADMIN_TASKS_ROOT_KEY,
  adminTasksKey,
  type AdminTaskListParams,
  type AdminTaskListResult,
  type ForceSubmissionStatus,
} from "@/lib/admin-internship-tasks-query";
import type { AttachmentAction } from "@/components/mentor/tasks/create/task-form";

function buildQuery(params: AdminTaskListParams): string {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.batchId) sp.set("batch", params.batchId);
  if (params.fieldId) sp.set("field", params.fieldId);
  if (params.classId) sp.set("class", params.classId);
  if (params.status) sp.set("status", params.status);
  if (params.page > 1) sp.set("page", String(params.page));
  return sp.toString();
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

async function fetchTasks(params: AdminTaskListParams): Promise<AdminTaskListResult> {
  const qs = buildQuery(params);
  const res = await fetch(`/api/admin/internship/tasks${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res, `Gagal memuat tugas (${res.status})`));
  const body = (await res.json()) as { data: AdminTaskListResult };
  return body.data;
}

export function useAdminTasksQuery(
  params: AdminTaskListParams,
  initialData?: AdminTaskListResult,
) {
  return useQuery({
    queryKey: adminTasksKey(params),
    queryFn: () => fetchTasks(params),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

/** Hard-delete a task (cascades submissions; server cleans up Bunny files). */
export function useAdminDeleteTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/admin/internship/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await parseError(res, "Gagal menghapus tugas."));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_TASKS_ROOT_KEY }),
  });
}

type UpdateTaskVars = {
  title: string;
  description: string;
  deadline: string;
  file: File | null;
  attachmentAction: AttachmentAction;
};

/** Edit an existing task (multipart; mirrors the mentor edit). */
export function useAdminUpdateTaskMutation(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: UpdateTaskVars) => {
      const fd = new FormData();
      fd.append("title", vars.title);
      fd.append("description", vars.description);
      fd.append("deadline", vars.deadline);
      fd.append("attachmentAction", vars.attachmentAction);
      if (vars.file) fd.append("file", vars.file);

      const res = await fetch(`/api/admin/internship/tasks/${taskId}`, {
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
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_TASKS_ROOT_KEY }),
  });
}

/** Force a student's submission status to SUBMITTED / NOT_SUBMITTED. */
export function useAdminSetSubmissionStatusMutation(taskId: string) {
  return useMutation({
    mutationFn: async (vars: {
      studentId: string;
      status: ForceSubmissionStatus;
    }) => {
      const res = await fetch(
        `/api/admin/internship/tasks/${taskId}/submissions/${vars.studentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ status: vars.status }),
        },
      );
      if (!res.ok)
        throw new Error(await parseError(res, "Gagal mengubah status pengumpulan."));
    },
  });
}
