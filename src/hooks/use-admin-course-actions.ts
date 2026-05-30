"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/**
 * Hard-delete a course. Server blocks deletion of courses with enrollments or
 * orders (409) — the thrown message surfaces that to the caller's toast.
 */
export function useDeleteCourseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menghapus kursus."));
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}
