"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { VoucherFormInput } from "@/lib/validations/admin-voucher";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Create a new voucher. Resolves with the new voucher id. */
export function useCreateVoucherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: VoucherFormInput): Promise<{ id: string }> => {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal membuat voucher."));
      }
      const json = (await res.json()) as { data: { id: string } };
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

/** Edit an existing voucher. */
export function useUpdateVoucherMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: VoucherFormInput) => {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menyimpan voucher."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}
