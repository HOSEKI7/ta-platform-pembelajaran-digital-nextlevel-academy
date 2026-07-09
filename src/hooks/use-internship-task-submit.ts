"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { internshipKeys } from "@/lib/internship-query-keys";

type SubmitResult = {
  submittedAtISO: string;
  fileName: string;
  fileSize: number;
};

type ApiResponse =
  | { data: SubmitResult; error?: undefined }
  | { error: string; data?: undefined };

/**
 * Uploads a peserta-magang's task submission via multipart POST. On success,
 * invalidates internship queries (dashboard count) and `router.refresh()` so
 * the detail page's server-loaded `task` reflects the new SUBMITTED state.
 */
export function useTaskSubmitMutation(taskId: string) {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<SubmitResult> => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/internship/tasks/${taskId}/submit`, {
        method: "POST",
        body: form,
      });
      const json = (await res.json().catch(() => null)) as ApiResponse | null;
      if (!res.ok || !json || "error" in json) {
        throw new Error(json?.error ?? "Gagal mengumpulkan tugas.");
      }
      return json.data;
    },
    onSuccess: () => {
      // Narrow: only attendance cache needs invalidation (dashboard uses TCQ).
      qc.invalidateQueries({ queryKey: internshipKeys.attendancePrefix() });
      router.refresh();
    },
  });
}
