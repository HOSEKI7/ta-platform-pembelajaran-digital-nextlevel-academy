"use client";

import { useEffect, useState } from "react";

import { BadgeCollection } from "./badge-collection";
import { LevelHeroCard } from "./level-hero-card";
import { RewardRoadmap } from "./reward-roadmap";
import type {
  BadgeItem,
  GameProfileMock,
  RewardMilestone,
} from "./mock-data";

const STORAGE_KEY = "nla:exp-level:claimed-vouchers";

type ClaimedMap = Record<number, true>;

type Props = {
  profile: GameProfileMock;
  milestones: RewardMilestone[];
  badges: BadgeItem[];
};

export function ExpLevelView({ profile, milestones, badges }: Props) {
  // Single combined state so the post-mount hydration only fires one setState
  // (mirrors the use-mobile pattern: initial sync after mount, then keep
  // updating in response to user actions).
  const [state, setState] = useState<{ claimed: ClaimedMap; hydrated: boolean }>(
    () => ({ claimed: {}, hydrated: false }),
  );

  useEffect(() => {
    let nextClaimed: ClaimedMap = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ClaimedMap;
        if (parsed && typeof parsed === "object") {
          nextClaimed = parsed;
        }
      }
    } catch {
      // ignore malformed JSON
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot localStorage hydration after mount
    setState({ claimed: nextClaimed, hydrated: true });
  }, []);

  const { claimed, hydrated } = state;

  const handleClaim = (level: number) => {
    setState((prev) => {
      const nextClaimed: ClaimedMap = { ...prev.claimed, [level]: true };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextClaimed));
      } catch {
        // ignore quota errors
      }
      return { ...prev, claimed: nextClaimed };
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <LevelHeroCard {...profile} />
      <RewardRoadmap
        currentLevel={profile.level}
        milestones={milestones}
        claimed={hydrated ? claimed : {}}
        onClaim={handleClaim}
      />
      <BadgeCollection badges={badges} />
    </div>
  );
}
