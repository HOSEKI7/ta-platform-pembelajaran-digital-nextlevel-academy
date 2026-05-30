"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

async function postAction(orderId: string, action: "accept" | "cancel") {
  const res = await fetch(`/api/admin/transactions/${orderId}/${action}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(
      await parseError(
        res,
        action === "accept"
          ? "Gagal menerima pembayaran."
          : "Gagal membatalkan pembayaran.",
      ),
    );
  }
}

/**
 * Accept a PENDING payment (manual fulfillment). Invalidates the admin
 * transactions cache and refreshes the server-rendered detail page so the new
 * status + log entry appear immediately.
 */
export function useAcceptPaymentMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (orderId: string) => postAction(orderId, "accept"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
      router.refresh();
    },
  });
}

/** Cancel a PENDING payment (mark FAILED). */
export function useCancelPaymentMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (orderId: string) => postAction(orderId, "cancel"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
      router.refresh();
    },
  });
}

/** Soft-delete a transaction. */
export function useDeleteTransactionMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/admin/transactions/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal menghapus transaksi."));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
      router.refresh();
    },
  });
}
