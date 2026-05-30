"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/** Toggle a voucher active/inactive (deactivate / reactivate). */
export function useSetVoucherActiveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/vouchers/${vars.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: vars.isActive }),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal mengubah status voucher."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

/**
 * Hard-delete a voucher. Server blocks deletion of used vouchers (409) — the
 * thrown message surfaces that to the caller's toast/dialog.
 */
export function useDeleteVoucherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menghapus voucher."));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}
