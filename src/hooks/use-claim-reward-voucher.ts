"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  RewardMilestoneLevel,
  RewardVoucherDTO,
} from "@/lib/gamification-types";

/**
 * Shape returned by the claim endpoint. `endDate` arrives as an ISO string
 * (JSON serialization of the server-side `Date`); the view converts it back to
 * a `Date` before patching the roadmap state.
 */
export type ClaimedRewardVoucher = Omit<RewardVoucherDTO, "endDate"> & {
  endDate: string | null;
};

async function claimRewardVoucher(
  targetLevel: RewardMilestoneLevel,
): Promise<ClaimedRewardVoucher> {
  const res = await fetch("/api/student/me/reward-vouchers/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ targetLevel }),
    cache: "no-store",
  });

  const text = await res.text();
  let json: { data?: ClaimedRewardVoucher; error?: string } = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* ignore malformed body */
  }

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? `Gagal mengklaim voucher (${res.status}).`);
  }
  return json.data;
}

export function useClaimRewardVoucher() {
  return useMutation<ClaimedRewardVoucher, Error, RewardMilestoneLevel>({
    mutationFn: claimRewardVoucher,
  });
}
