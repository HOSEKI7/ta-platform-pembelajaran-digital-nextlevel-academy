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
  expiresAt: string;
};

async function postJson<TBody, TData>(path: string, body: TBody): Promise<TData> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  // We intentionally tolerate both `{ data }` (success) and `{ error }`
  // (failure) shapes — and propagate the server's Indonesian message so the
  // form can surface it inline.
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

export function useCreateOrder() {
  return useMutation<CreatedOrder, Error, CreateOrderInput>({
    mutationFn: (input) => postJson("/api/orders", input),
  });
}
