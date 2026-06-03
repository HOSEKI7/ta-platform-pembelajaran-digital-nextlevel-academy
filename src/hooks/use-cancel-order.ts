"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { studentKeys } from "@/lib/student-query-keys";

async function cancelOrder(orderId: string): Promise<void> {
  const res = await fetch(`/api/payment/orders/${orderId}/cancel`, {
    method: "POST",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Gagal membatalkan pembayaran (${res.status}).`);
  }
}

/**
 * Cancels a PENDING order (wrong-method recovery). On success the order becomes
 * FAILED — freeing the double-purchase guard so the same course can be bought
 * again. Invalidates the polled order status.
 */
export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.orderStatus(orderId) });
    },
  });
}
