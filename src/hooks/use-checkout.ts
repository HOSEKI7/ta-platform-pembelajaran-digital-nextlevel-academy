"use client";

import { useMutation } from "@tanstack/react-query";

import type { CreateOrderInput, ValidateVoucherInput } from "@/lib/validators/checkout";

export type AppliedVoucher = {
  code: string;
  description: string | null;
  discountPct: number;
  discountAmount: number;
  finalPrice: number;
};

export type CreatedOrder = {
  orderId: string;
  /** Present for paid orders (PENDING). */
  expiresAt?: string;
  /** True when Midtrans is not configured — payment page offers a dev simulate. */
  simulated?: boolean;
  /** "SUCCESS" only for free orders fulfilled instantly. */
  status?: "SUCCESS";
  /** Course slug — returned for free orders so the client can jump to the course. */
  slug?: string;
};

/** Carries the existing order id when checkout is blocked by a live PENDING order. */
export class CreateOrderError extends Error {
  resumeOrderId?: string;
  constructor(message: string, resumeOrderId?: string) {
    super(message);
    this.name = "CreateOrderError";
    this.resumeOrderId = resumeOrderId;
  }
}

async function postJson<TBody, TData>(path: string, body: TBody): Promise<TData> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let json: { data?: TData; error?: string } = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(json.error ?? `Gagal memproses permintaan (${res.status}).`);
  }
  if (!json.data) {
    throw new Error("Respon tidak valid.");
  }
  return json.data;
}

export function useValidateVoucher() {
  return useMutation<AppliedVoucher, Error, ValidateVoucherInput>({
    mutationFn: (input) => postJson("/api/vouchers/validate", input),
  });
}

async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: CreatedOrder & { orderId?: string };
    error?: string;
  };

  if (!res.ok) {
    // 409 (live PENDING order) ships an orderId so the UI can resume payment.
    throw new CreateOrderError(
      json.error ?? `Gagal membuat pesanan (${res.status}).`,
      json.data?.orderId,
    );
  }
  if (!json.data) throw new Error("Respon tidak valid.");
  return json.data;
}

export function useCreateOrder() {
  return useMutation<CreatedOrder, Error, CreateOrderInput>({
    mutationFn: createOrder,
  });
}
