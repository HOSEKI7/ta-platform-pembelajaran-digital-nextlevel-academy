"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CategoryFormInput } from "@/lib/validations/admin-category";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Create a new category. Resolves with the new category id. */
export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CategoryFormInput): Promise<{ id: string }> => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal membuat kategori."));
      }
      const json = (await res.json()) as { data: { id: string } };
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

/** Edit an existing category. */
export function useUpdateCategoryMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CategoryFormInput) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menyimpan kategori."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}
