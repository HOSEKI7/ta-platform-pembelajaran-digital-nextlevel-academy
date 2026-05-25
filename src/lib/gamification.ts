import "server-only";

import { BadgeTrigger, ExpSource, Prisma } from "@/generated/prisma";
import { expProgress, expRequiredForNextLevel } from "@/lib/game-formula";
import {
  badgeTitleForLevel,
  badgeVisual,
  type BadgeItemDTO,
  type BadgeTriggerKey,
  type GameSummaryDTO,
  type RewardDiscountPct,
  type RewardMilestoneLevel,
  type RewardVoucherDTO,
  type VoucherStatus,
} from "@/lib/gamification-types";
import { prisma } from "@/lib/prisma";
import { generateVoucherCode } from "@/lib/voucher-code";

/**
 * Gamification engine (PRD §6.7). Single source of truth for the level-up
 * cascade, badge awarding, and reward-voucher issuance — used by the EXP-award
 * route handlers (`/api/learn/...`) and the `/exp-level` page loader.
 *
 * Two invariants from the PRD/data model:
 *   1. `UserGameProfile.exp` resets to 0 on level-up (no carry-over, §6.7.2),
 *      so a single award triggers at most one level-up.
 *   2. EXP is awarded once per `(userId, source, refId)` — enforced by the
 *      `ExpLog @@unique` constraint; we treat the P2002 violation as "already
 *      awarded" and skip the profile increment.
 */

/** Reward voucher validity window (user-chosen). */
export const REWARD_VOUCHER_VALID_DAYS = 180;

/** PRD §6.7.4 — discount % granted at each milestone level. */
export const LEVEL_VOUCHER_MILESTONES: Record<
  RewardMilestoneLevel,
  RewardDiscountPct
> = { 5: 20, 10: 35, 15: 50 };

const REWARD_MILESTONE_LEVELS: RewardMilestoneLevel[] = [5, 10, 15];

/**
 * Accepts either the singleton `prisma` client or an interactive transaction
 * client (`tx`). A full `PrismaClient` is structurally assignable here, so
 * engine functions run inside or outside a `$transaction` unchanged.
 */
type Db = Prisma.TransactionClient;

/** Thrown by `claimRewardVoucher` to carry an HTTP status to the route. */
export class GamificationError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * True when `err` is a Prisma unique-constraint violation (P2002).
 *
 * We deliberately duck-type on the stable `code` field instead of
 * `err instanceof Prisma.PrismaClientKnownRequestError`: in the Next.js /
 * Turbopack server runtime the generated client that throws the error and the
 * `Prisma` namespace imported into this module can be distinct bundle copies,
 * so the prototype chain doesn't match and `instanceof` returns false even for
 * a genuine `PrismaClientKnownRequestError`. That silently broke every
 * idempotency guard below (e.g. re-running `reconcileLevelBadges` on each
 * `/exp-level` load). The numeric error code is identity-independent.
 */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

// -----------------------------------------------------------------------------
// EXP + level-up cascade
// -----------------------------------------------------------------------------

type AwardExpResult = {
  /** EXP actually granted (0 when this source was already awarded). */
  awarded: number;
  leveledUp: boolean;
  /** Level after the award, or `null` when nothing was awarded. */
  newLevel: number | null;
};

/**
 * Records an EXP award (idempotent via `ExpLog`) and, when newly granted,
 * applies it to the profile and runs the level-up cascade. Replaces the inline
 * try/catch + profile-upsert blocks the two learn routes used to duplicate.
 */
export async function awardExp(
  db: Db,
  args: { userId: string; amount: number; source: ExpSource; refId: string },
): Promise<AwardExpResult> {
  const { userId, amount, source, refId } = args;

  try {
    await db.expLog.create({ data: { userId, amount, source, refId } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      // Already awarded for this (user, source, refId) — no double grant.
      return { awarded: 0, leveledUp: false, newLevel: null };
    }
    throw err;
  }

  const { leveledUp, newLevel } = await applyExpGain(db, userId, amount);
  return { awarded: amount, leveledUp, newLevel };
}

/**
 * Increments the profile's `exp` + `totalExp`, then applies the §6.7.2 rule:
 * if `exp >= REQ(level)` the student levels up, `exp` resets to 0, and any
 * LEVEL_REACHED badges for the new level are awarded. Reset-to-0 means at most
 * one level-up per call.
 */
async function applyExpGain(
  db: Db,
  userId: string,
  amount: number,
): Promise<{ leveledUp: boolean; newLevel: number }> {
  const profile = await db.userGameProfile.upsert({
    where: { userId },
    create: { userId, exp: amount, totalExp: amount },
    update: { exp: { increment: amount }, totalExp: { increment: amount } },
    select: { level: true, exp: true },
  });

  if (profile.exp >= expRequiredForNextLevel(profile.level)) {
    const newLevel = profile.level + 1;
    await db.userGameProfile.update({
      where: { userId },
      data: { level: newLevel, exp: 0 },
    });
    await awardLevelBadges(db, userId, newLevel);
    return { leveledUp: true, newLevel };
  }

  return { leveledUp: false, newLevel: profile.level };
}

// -----------------------------------------------------------------------------
// Badges
// -----------------------------------------------------------------------------

/** Creates a UserBadge per badge, idempotent via unique([userId, badgeId]). */
async function awardBadges(
  db: Db,
  userId: string,
  badges: { id: string; name: string }[],
): Promise<void> {
  for (const badge of badges) {
    try {
      await db.userBadge.create({
        data: { userId, badgeId: badge.id, badgeSnapshot: badge.name },
      });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        // Already earned — fine.
        continue;
      }
      throw err;
    }
  }
}

/** Awards every LEVEL_REACHED badge with `threshold <= level`. */
async function awardLevelBadges(
  db: Db,
  userId: string,
  level: number,
): Promise<void> {
  const badges = await db.badge.findMany({
    where: { trigger: BadgeTrigger.LEVEL_REACHED, threshold: { lte: level } },
    select: { id: true, name: true },
  });
  await awardBadges(db, userId, badges);
}

/**
 * Awards completion-driven badges after a course is finished:
 *   - COURSE_SPECIFIC badges tied to this `courseId`
 *   - COURSES_COMPLETED badges whose `threshold <= total completed courses`
 * Call AFTER `Enrollment.completedAt` is set so the count includes this course.
 */
export async function awardCompletionBadges(
  db: Db,
  userId: string,
  courseId: string,
): Promise<void> {
  const completedCount = await db.enrollment.count({
    where: { userId, completedAt: { not: null } },
  });
  const badges = await db.badge.findMany({
    where: {
      OR: [
        { trigger: BadgeTrigger.COURSE_SPECIFIC, courseId },
        {
          trigger: BadgeTrigger.COURSES_COMPLETED,
          threshold: { lte: completedCount },
        },
      ],
    },
    select: { id: true, name: true },
  });
  await awardBadges(db, userId, badges);
}

/**
 * Idempotent safety net for the `/exp-level` page: ensures the student holds
 * every LEVEL_REACHED badge their current level entitles them to, even if the
 * level was reached outside the cascade (e.g. test data set directly in the
 * DB). In steady state it only reads.
 */
export async function reconcileLevelBadges(
  userId: string,
  level: number,
): Promise<void> {
  await awardLevelBadges(prisma, userId, level);
}

// -----------------------------------------------------------------------------
// Reward vouchers (claim flow)
// -----------------------------------------------------------------------------

type VoucherRow = {
  code: string;
  endDate: Date;
  usageCount: number;
  isActive: boolean;
};

function voucherStatusOf(v: VoucherRow): VoucherStatus {
  if (v.usageCount > 0) return "used";
  if (!v.isActive || new Date() > v.endDate) return "expired";
  return "active";
}

function buildRewardVoucherDTO(
  targetLevel: RewardMilestoneLevel,
  level: number,
  voucher: VoucherRow | null,
): RewardVoucherDTO {
  const discountPct = LEVEL_VOUCHER_MILESTONES[targetLevel];
  if (!voucher) {
    return {
      targetLevel,
      discountPct,
      state: level >= targetLevel ? "claimable" : "locked",
      code: null,
      endDate: null,
      voucherStatus: null,
    };
  }
  return {
    targetLevel,
    discountPct,
    state: "claimed",
    code: voucher.code,
    endDate: voucher.endDate,
    voucherStatus: voucherStatusOf(voucher),
  };
}

async function createVoucherWithUniqueCode(
  db: Db,
  args: {
    targetLevel: RewardMilestoneLevel;
    discountPct: RewardDiscountPct;
    userId: string;
    startDate: Date;
    endDate: Date;
  },
): Promise<VoucherRow> {
  const { targetLevel, discountPct, userId, startDate, endDate } = args;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.voucher.create({
        data: {
          code: generateVoucherCode(targetLevel),
          description: `Reward Level ${targetLevel} — diskon ${discountPct}%`,
          discountPct,
          startDate,
          endDate,
          maxUsagePerUser: 1,
          allowedUserId: userId,
          isSystemGenerated: true,
          isActive: true,
        },
        select: { code: true, endDate: true, usageCount: true, isActive: true },
      });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        // Code collision (astronomically unlikely) — regenerate and retry.
        continue;
      }
      throw err;
    }
  }
  throw new GamificationError(500, "Gagal membuat kode voucher unik.");
}

/**
 * Claims the reward voucher for `targetLevel`. Requires the student to have
 * reached that level. Idempotent: one system voucher per (user, discountPct) —
 * a repeat claim returns the existing voucher instead of issuing a duplicate.
 */
export async function claimRewardVoucher(
  db: Db,
  userId: string,
  targetLevel: RewardMilestoneLevel,
): Promise<RewardVoucherDTO> {
  const discountPct = LEVEL_VOUCHER_MILESTONES[targetLevel];

  const profile = await db.userGameProfile.findUnique({
    where: { userId },
    select: { level: true },
  });
  const level = profile?.level ?? 1;
  if (level < targetLevel) {
    throw new GamificationError(
      403,
      `Kamu belum mencapai Level ${targetLevel}.`,
    );
  }

  const existing = await db.voucher.findFirst({
    where: { allowedUserId: userId, isSystemGenerated: true, discountPct },
    select: { code: true, endDate: true, usageCount: true, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return buildRewardVoucherDTO(targetLevel, level, existing);
  }

  const now = new Date();
  const endDate = new Date(
    now.getTime() + REWARD_VOUCHER_VALID_DAYS * 24 * 60 * 60 * 1000,
  );
  const created = await createVoucherWithUniqueCode(db, {
    targetLevel,
    discountPct,
    userId,
    startDate: now,
    endDate,
  });
  return buildRewardVoucherDTO(targetLevel, level, created);
}

// -----------------------------------------------------------------------------
// Read loaders for the /exp-level page
// -----------------------------------------------------------------------------

export async function loadGameSummary(userId: string): Promise<GameSummaryDTO> {
  const profile = await prisma.userGameProfile.findUnique({
    where: { userId },
    select: { level: true, exp: true, totalExp: true },
  });
  const level = profile?.level ?? 1;
  const exp = profile?.exp ?? 0;
  const totalExp = profile?.totalExp ?? 0;
  return {
    level,
    exp,
    totalExp,
    expToNext: expProgress({ level, exp }),
    badgeTitle: badgeTitleForLevel(level),
  };
}

function describeBadge(trigger: BadgeTriggerKey, threshold: number): string {
  switch (trigger) {
    case "LEVEL_REACHED":
      return `Capai Level ${threshold} untuk membuka badge ini.`;
    case "COURSES_COMPLETED":
      return `Selesaikan ${threshold} kursus berbeda hingga 100%.`;
    case "COURSE_SPECIFIC":
      return "Selesaikan kursus tertentu untuk meraih badge ini.";
  }
}

export async function loadBadges(userId: string): Promise<BadgeItemDTO[]> {
  const [badges, earned] = await Promise.all([
    prisma.badge.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        trigger: true,
        threshold: true,
      },
      orderBy: [{ trigger: "asc" }, { threshold: "asc" }],
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    }),
  ]);

  const earnedMap = new Map<string, Date>();
  for (const row of earned) {
    if (row.badgeId) earnedMap.set(row.badgeId, row.earnedAt);
  }

  return badges.map((b) => {
    const trigger = b.trigger as BadgeTriggerKey;
    return {
      id: b.id,
      name: b.name,
      description: b.description ?? describeBadge(trigger, b.threshold),
      trigger,
      threshold: b.threshold,
      ...badgeVisual({ trigger, threshold: b.threshold }),
      earnedAt: earnedMap.get(b.id) ?? null,
    };
  });
}

export async function loadRewardVouchers(
  userId: string,
): Promise<RewardVoucherDTO[]> {
  const [profile, vouchers] = await Promise.all([
    prisma.userGameProfile.findUnique({
      where: { userId },
      select: { level: true },
    }),
    prisma.voucher.findMany({
      where: { allowedUserId: userId, isSystemGenerated: true },
      select: {
        code: true,
        endDate: true,
        usageCount: true,
        isActive: true,
        discountPct: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const level = profile?.level ?? 1;

  // Keep the most recent voucher per discount tier (query is already desc).
  const byPct = new Map<number, VoucherRow>();
  for (const v of vouchers) {
    if (!byPct.has(v.discountPct)) {
      byPct.set(v.discountPct, {
        code: v.code,
        endDate: v.endDate,
        usageCount: v.usageCount,
        isActive: v.isActive,
      });
    }
  }

  return REWARD_MILESTONE_LEVELS.map((targetLevel) =>
    buildRewardVoucherDTO(
      targetLevel,
      level,
      byPct.get(LEVEL_VOUCHER_MILESTONES[targetLevel]) ?? null,
    ),
  );
}

export type ExpLevelPageData = {
  summary: GameSummaryDTO;
  badges: BadgeItemDTO[];
  vouchers: RewardVoucherDTO[];
};

/**
 * Single entry point for the `/exp-level` Server Component: reconciles level
 * badges (idempotent) then loads the profile summary, badge collection, and
 * reward-voucher roadmap.
 */
export async function loadExpLevelPage(
  userId: string,
): Promise<ExpLevelPageData> {
  const summary = await loadGameSummary(userId);
  await reconcileLevelBadges(userId, summary.level);
  const [badges, vouchers] = await Promise.all([
    loadBadges(userId),
    loadRewardVouchers(userId),
  ]);
  return { summary, badges, vouchers };
}
