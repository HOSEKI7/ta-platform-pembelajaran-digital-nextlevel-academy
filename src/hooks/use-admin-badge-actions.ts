"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Hard-delete a badge. Earned history is preserved server-side. */
export function useDeleteBadgeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/badges/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menghapus badge."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "badges"] }),
  });
}
