import "server-only";

import { BadgeTrigger, type Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { isValidBadgeIconPath } from "@/lib/badge-icons";
import { removeBunnyFile } from "@/lib/bunny-storage";
import type { BadgeFormInput } from "@/lib/validations/admin-badge";

/**
 * Server-side write operations for admin badges (PRD §6.11.8). Centralises
 * create / update / delete + AuditLog so the route handlers stay thin. The
 * trigger is immutable after creation (PRD): `updateBadge` ignores any incoming
 * trigger and re-normalises against the stored one. Deleting a badge is safe —
 * `UserBadge.badgeId` is `onDelete: SetNull` and `badgeSnapshot` preserves the
 * name, so earned history survives.
 */

export type AdminActionContext = {
  actorId: string;
};

export type BadgeWriteFailure = "not_found" | "invalid_course" | "invalid" | "error";

export type BadgeWriteResult =
  | { ok: true; id: string }
  | { ok: false; reason: BadgeWriteFailure };

function auditData(
  ctx: AdminActionContext,
  action: string,
  badgeId: string,
  metadata: Prisma.InputJsonValue,
) {
  return {
    actorId: ctx.actorId,
    action,
    entityType: "Badge",
    entityId: badgeId,
    metadata,
  };
}

/** A logoUrl is acceptable if null, a known preset, or one of our Bunny uploads. */
function isAllowedLogo(value: string | null): boolean {
  if (value == null) return true;
  if (isValidBadgeIconPath(value)) return true;
  return value.startsWith("badge-icons/");
}

/** True when the stored logo lives in Bunny (deletable), not a public preset. */
function isBunnyLogo(value: string | null): boolean {
  return value != null && value.startsWith("badge-icons/");
}

type NormalizedBadge = {
  name: string;
  description: string | null;
  threshold: number;
  courseId: string | null;
  expMinimum: number;
  logoUrl: string | null;
};

function normalize(input: BadgeFormInput, trigger: BadgeTrigger): NormalizedBadge {
  const isCourseSpecific = trigger === BadgeTrigger.COURSE_SPECIFIC;
  return {
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    threshold: isCourseSpecific ? 0 : input.threshold,
    courseId: isCourseSpecific ? (input.courseId ?? null) : null,
    expMinimum: input.expMinimum,
    logoUrl: input.logoUrl?.trim() ? input.logoUrl.trim() : null,
  };
}

async function courseExists(courseId: string): Promise<boolean> {
  const c = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  return Boolean(c);
}

export async function createBadge(
  input: BadgeFormInput,
  ctx: AdminActionContext,
): Promise<BadgeWriteResult> {
  const trigger = input.trigger;
  const data = normalize(input, trigger);

  if (!isAllowedLogo(data.logoUrl)) return { ok: false, reason: "invalid" };
  if (trigger === BadgeTrigger.COURSE_SPECIFIC) {
    if (!data.courseId || !(await courseExists(data.courseId))) {
      return { ok: false, reason: "invalid_course" };
    }
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const badge = await tx.badge.create({
        data: { trigger, ...data },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: auditData(ctx, "BADGE_CREATE", badge.id, {
          name: data.name,
          trigger,
        }),
      });
      return badge;
    });
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("[createBadge] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function updateBadge(
  id: string,
  input: BadgeFormInput,
  ctx: AdminActionContext,
): Promise<BadgeWriteResult> {
  const existing = await prisma.badge.findUnique({
    where: { id },
    select: { id: true, trigger: true, logoUrl: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  // Trigger is immutable — always normalise against the stored trigger.
  const trigger = existing.trigger;
  const data = normalize(input, trigger);

  if (!isAllowedLogo(data.logoUrl)) return { ok: false, reason: "invalid" };
  if (trigger === BadgeTrigger.COURSE_SPECIFIC) {
    if (!data.courseId || !(await courseExists(data.courseId))) {
      return { ok: false, reason: "invalid_course" };
    }
  }

  try {
    await prisma.$transaction([
      prisma.badge.update({ where: { id }, data }),
      prisma.auditLog.create({
        data: auditData(ctx, "BADGE_UPDATE", id, { name: data.name }),
      }),
    ]);
  } catch (err) {
    console.error("[updateBadge] failed", err);
    return { ok: false, reason: "error" };
  }

  // Reclaim the replaced Bunny icon if it changed.
  if (isBunnyLogo(existing.logoUrl) && existing.logoUrl !== data.logoUrl) {
    await removeBunnyFile(existing.logoUrl as string);
  }
  return { ok: true, id };
}

export async function deleteBadge(
  id: string,
  ctx: AdminActionContext,
): Promise<BadgeWriteResult> {
  const existing = await prisma.badge.findUnique({
    where: { id },
    select: { id: true, name: true, logoUrl: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  try {
    // Safe: UserBadge.badgeId is SetNull + badgeSnapshot preserves history.
    await prisma.$transaction([
      prisma.badge.delete({ where: { id } }),
      prisma.auditLog.create({
        data: auditData(ctx, "BADGE_DELETE", id, { name: existing.name }),
      }),
    ]);
  } catch (err) {
    console.error("[deleteBadge] failed", err);
    return { ok: false, reason: "error" };
  }

  if (isBunnyLogo(existing.logoUrl)) {
    await removeBunnyFile(existing.logoUrl as string);
  }
  return { ok: true, id };
}

export function describeBadgeFailure(reason: BadgeWriteFailure): {
  status: number;
  error: string;
} {
  switch (reason) {
    case "not_found":
      return { status: 404, error: "Badge tidak ditemukan." };
    case "invalid_course":
      return { status: 400, error: "Kursus yang dipilih tidak ditemukan." };
    case "invalid":
      return { status: 400, error: "Data badge tidak valid." };
    case "error":
      return { status: 500, error: "Gagal memproses badge. Coba lagi." };
  }
}
