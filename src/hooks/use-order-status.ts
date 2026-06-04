"use client";

import { useQuery } from "@tanstack/react-query";

import type { TransactionStatus } from "@/lib/transaction-data-loader";
import { studentKeys } from "@/lib/student-query-keys";

export type OrderStatusDTO = {
  status: TransactionStatus;
  expiresAt: string;
};

const TERMINAL: TransactionStatus[] = ["SUCCESS", "FAILED", "EXPIRED", "CANCELED"];

async function fetchOrderStatus(orderId: string): Promise<OrderStatusDTO> {
  const res = await fetch(`/api/payment/orders/${orderId}/status`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: OrderStatusDTO;
    error?: string;
  };
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? `Gagal memuat status (${res.status}).`);
  }
  return json.data;
}

/**
 * Polls an order's status so the payment page reacts to webhook-driven updates
 * without a manual refresh. Polling stops once the status is terminal.
 */
export function useOrderStatusQuery(orderId: string, initialStatus: TransactionStatus) {
  return useQuery<OrderStatusDTO>({
    queryKey: studentKeys.orderStatus(orderId),
    queryFn: () => fetchOrderStatus(orderId),
    initialData: undefined,
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? initialStatus;
      return TERMINAL.includes(status) ? false : 5000;
    },
    refetchOnWindowFocus: true,
  });
}
