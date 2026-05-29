"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mentorKeys } from "@/lib/mentor-query-keys";

export type UpsertGradePayload = {
  grade: number;
  note: string | null;
};

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Assign or update a mentee's final grade (upsert, mirrors task actions). */
export function useUpsertGradeMutation(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertGradePayload) => {
      const res = await fetch(`/api/mentor/grades/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await parseError(res, "Gagal menyimpan nilai."));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mentorKeys.all }),
  });
}
