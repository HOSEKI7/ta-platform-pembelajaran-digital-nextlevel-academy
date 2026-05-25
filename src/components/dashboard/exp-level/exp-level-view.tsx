"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useClaimRewardVoucher } from "@/hooks/use-claim-reward-voucher";
import type {
  BadgeItemDTO,
  GameSummaryDTO,
  RewardMilestoneLevel,
  RewardVoucherDTO,
} from "@/lib/gamification-types";

import { BadgeCollection } from "./badge-collection";
import { LevelHeroCard } from "./level-hero-card";
import { RewardRoadmap } from "./reward-roadmap";

type Props = {
  summary: GameSummaryDTO;
  badges: BadgeItemDTO[];
  vouchers: RewardVoucherDTO[];
};

export function ExpLevelView({ summary, badges, vouchers }: Props) {
  // Seed from the server-loaded roadmap; patch locally on a successful claim so
  // the card flips to "claimed" without a full page refetch.
  const [milestones, setMilestones] = useState<RewardVoucherDTO[]>(vouchers);
  const claim = useClaimRewardVoucher();

  const handleClaim = (targetLevel: RewardMilestoneLevel) => {
    if (claim.isPending) return;
    claim.mutate(targetLevel, {
      onSuccess: (voucher) => {
        setMilestones((prev) =>
          prev.map((m) =>
            m.targetLevel === targetLevel
              ? {
                  ...m,
                  state: "claimed",
                  code: voucher.code,
                  endDate: voucher.endDate ? new Date(voucher.endDate) : null,
                  voucherStatus: voucher.voucherStatus,
                }
              : m,
          ),
        );
        toast.success(`Voucher Level ${targetLevel} berhasil diklaim!`);
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <LevelHeroCard {...summary} />
      <RewardRoadmap
        currentLevel={summary.level}
        milestones={milestones}
        onClaim={handleClaim}
        claimingLevel={claim.isPending ? (claim.variables ?? null) : null}
      />
      <BadgeCollection badges={badges} />
    </div>
  );
}
