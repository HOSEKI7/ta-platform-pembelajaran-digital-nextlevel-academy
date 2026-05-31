"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BadgeFormInput } from "@/lib/validations/admin-badge";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Create a new badge. Resolves with the new badge id. */
export function useCreateBadgeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BadgeFormInput): Promise<{ id: string }> => {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal membuat badge."));
      }
      const json = (await res.json()) as { data: { id: string } };
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "badges"] }),
  });
}

/** Edit an existing badge (trigger is immutable server-side). */
export function useUpdateBadgeMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BadgeFormInput) => {
      const res = await fetch(`/api/admin/badges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menyimpan badge."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "badges"] }),
  });
}
