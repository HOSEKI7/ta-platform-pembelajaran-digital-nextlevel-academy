"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { studentKeys } from "@/lib/student-query-keys";

async function cancelOrder(orderId: string): Promise<void> {
  const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Gagal membatalkan pembayaran.");
  }
}

/**
 * Cancels the student's own PENDING order (flips it to CANCELED). Invalidates
 * the polled order-status query and refreshes the server-rendered detail page
 * so the "Dibatalkan" state + "Beli Lagi" CTA appear immediately.
 */
export function useCancelOrderMutation(orderId: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.orderStatus(orderId) });
      qc.invalidateQueries({ queryKey: studentKeys.transactions() });
      router.refresh();
    },
  });
}
