/**
 * Read-only gamification rule data for the admin "Aturan EXP" tab (PRD §6.11.8).
 *
 * The canonical EXP amounts live inline in the learn award routes
 * (`src/app/api/learn/[stepId]/complete/route.ts` → +15 video / +600 course,
 * `.../quiz/submit/route.ts` → +90 quiz). They are mirrored here as plain
 * constants so the admin display (and any client component) can show them
 * without importing the server-only award routes. Keep the two in sync when an
 * amount changes — these are presentational only and never drive an award.
 *
 * This module is NOT `server-only`: it holds pure data + re-exports the pure
 * formula helpers, safe to import from client components.
 */

import { expRequiredForNextLevel } from "@/lib/game-formula";

/** A single EXP-earning action shown in the read-only rules table. */
export type ExpActionRule = {
  /** Matches the Prisma `ExpSource` enum value (kept as a string union). */
  source: "VIDEO_COMPLETE" | "QUIZ_PASS" | "COURSE_COMPLETE";
  label: string;
  exp: number;
  note: string;
};

export const EXP_ACTION_RULES: ExpActionRule[] = [
  {
    source: "VIDEO_COMPLETE",
    label: "Menyelesaikan video pembelajaran",
    exp: 15,
    note: "Diberikan sekali per video (tidak berulang).",
  },
  {
    source: "QUIZ_PASS",
    label: "Lulus kuis",
    exp: 90,
    note: "Hanya pada kelulusan pertama; mengulang tidak menambah EXP.",
  },
  {
    source: "COURSE_COMPLETE",
    label: "Menyelesaikan kursus (progres 100%)",
    exp: 600,
    note: "Diberikan sekali saat seluruh tahap kursus tuntas.",
  },
];

/** Title/badge tier unlocked at each level threshold (PRD §6.7.3). */
export type LevelTitleRule = {
  minLevel: number;
  title: string;
  description: string;
};

export const LEVEL_TITLE_RULES: LevelTitleRule[] = [
  { minLevel: 1, title: "Beginner", description: "Level 1 – 4" },
  { minLevel: 5, title: "Explorer", description: "Level 5 – 9" },
  { minLevel: 10, title: "Scholar", description: "Level 10 – 14" },
  { minLevel: 15, title: "Master", description: "Level 15 ke atas" },
];

/** Reward voucher tiers granted at milestone levels (PRD §6.7.4). */
export type RewardVoucherRule = {
  level: 5 | 10 | 15;
  discountPct: 20 | 35 | 50;
};

export const REWARD_VOUCHER_RULES: RewardVoucherRule[] = [
  { level: 5, discountPct: 20 },
  { level: 10, discountPct: 35 },
  { level: 15, discountPct: 50 },
];

/** Validity window (days) of a claimed reward voucher (PRD §6.7.4). */
export const REWARD_VOUCHER_VALID_DAYS = 180;

/** Human-readable level-up formula (PRD §6.7.2). */
export const EXP_LEVEL_FORMULA = "REQ(L) = 744 + 124 × (L − 1)";

/** Sample EXP requirements for the first few levels, for the explainer. */
export function sampleLevelRequirements(count = 6): { level: number; req: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    level: i + 1,
    req: expRequiredForNextLevel(i + 1),
  }));
}
