/**
 * Shared gamification DTOs + visual mapping (PRD §6.7).
 *
 * Lives in its own module (NOT `server-only`) so both the server-side loaders
 * in `@/lib/gamification` and the client components under
 * `@/components/dashboard/exp-level` can import the same types without pulling
 * Prisma into the client bundle. `trigger` is kept as a plain string union
 * (matching the Prisma `BadgeTrigger` enum values) for that reason.
 */

import type { ExpProgress } from "@/lib/game-formula";

export type BadgeIconKey =
  | "sparkles"
  | "trophy"
  | "flame"
  | "crown"
  | "award"
  | "star"
  | "rocket"
  | "graduation-cap";

export type BadgeTriggerKey =
  | "LEVEL_REACHED"
  | "COURSES_COMPLETED"
  | "COURSE_SPECIFIC";

export type BadgeItemDTO = {
  id: string;
  name: string;
  description: string;
  trigger: BadgeTriggerKey;
  threshold: number;
  iconKey: BadgeIconKey;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  earnedAt: Date | null;
};

export type RewardMilestoneLevel = 5 | 10 | 15;
export type RewardDiscountPct = 20 | 35 | 50;

/** Lifecycle of an issued reward voucher, shown as a status chip on the page. */
export type VoucherStatus = "active" | "used" | "expired";

export type RewardVoucherDTO = {
  targetLevel: RewardMilestoneLevel;
  discountPct: RewardDiscountPct;
  /**
   * - `locked`     — current level < targetLevel (preview only)
   * - `claimable`  — level reached but voucher not claimed yet
   * - `claimed`    — voucher exists in DB (show `code` + `voucherStatus`)
   */
  state: "locked" | "claimable" | "claimed";
  code: string | null;
  endDate: Date | null;
  voucherStatus: VoucherStatus | null;
};

export type GameSummaryDTO = {
  level: number;
  exp: number;
  totalExp: number;
  expToNext: ExpProgress;
  badgeTitle: string;
};

/** PRD §6.7.3 — title/badge unlocked at each level threshold. */
export function badgeTitleForLevel(level: number): string {
  if (level >= 15) return "Master";
  if (level >= 10) return "Scholar";
  if (level >= 5) return "Explorer";
  return "Beginner";
}

type BadgeVisual = Pick<
  BadgeItemDTO,
  "iconKey" | "gradientFrom" | "gradientTo" | "glowColor"
>;

/**
 * Derives the medallion icon + gradient for a badge from its trigger/threshold,
 * so the polished UI stays consistent without storing styling in the DB.
 * Mirrors the colours used by the original mock so nothing visually regresses.
 */
export function badgeVisual(badge: {
  trigger: BadgeTriggerKey;
  threshold: number;
}): BadgeVisual {
  if (badge.trigger === "LEVEL_REACHED") {
    if (badge.threshold >= 15) {
      return {
        iconKey: "crown",
        gradientFrom: "from-amber-400",
        gradientTo: "to-yellow-600",
        glowColor: "rgba(234,179,8,0.55)",
      };
    }
    if (badge.threshold >= 10) {
      return {
        iconKey: "graduation-cap",
        gradientFrom: "from-violet-400",
        gradientTo: "to-indigo-600",
        glowColor: "rgba(99,102,241,0.55)",
      };
    }
    if (badge.threshold >= 5) {
      return {
        iconKey: "rocket",
        gradientFrom: "from-orange-400",
        gradientTo: "to-rose-500",
        glowColor: "rgba(251,113,133,0.55)",
      };
    }
    return {
      iconKey: "sparkles",
      gradientFrom: "from-sky-400",
      gradientTo: "to-blue-600",
      glowColor: "rgba(59,130,246,0.55)",
    };
  }

  if (badge.trigger === "COURSES_COMPLETED") {
    if (badge.threshold >= 10) {
      return {
        iconKey: "award",
        gradientFrom: "from-emerald-400",
        gradientTo: "to-teal-600",
        glowColor: "rgba(16,185,129,0.55)",
      };
    }
    return {
      iconKey: "trophy",
      gradientFrom: "from-amber-300",
      gradientTo: "to-amber-600",
      glowColor: "rgba(245,158,11,0.55)",
    };
  }

  // COURSE_SPECIFIC
  return {
    iconKey: "star",
    gradientFrom: "from-fuchsia-400",
    gradientTo: "to-purple-600",
    glowColor: "rgba(217,70,239,0.55)",
  };
}
