import "server-only";

import { prisma } from "@/lib/prisma";
import { PLATFORM_INFO_KEY } from "@/lib/admin-settings-loader";
import type { PlatformInfo } from "@/lib/validations/admin-platform-settings";

/**
 * Admin-side write for the "Informasi Platform" tab (PRD §6.11.11).
 *
 * Upserts the whole blob as one `platform_setting` row (`PLATFORM_INFO`) and
 * records the change in `AuditLog` within the same transaction — mirrors
 * `updateCertExpirySetting` (`admin-certificate-write.ts`).
 */

export type AdminActionContext = {
  actorId: string;
  ip: string | null;
  ua: string | null;
};

export async function updatePlatformInfo(
  input: PlatformInfo,
  ctx: AdminActionContext,
): Promise<{ ok: true } | { ok: false }> {
  const value = JSON.stringify(input);

  try {
    await prisma.$transaction([
      prisma.platformSetting.upsert({
        where: { key: PLATFORM_INFO_KEY },
        create: { key: PLATFORM_INFO_KEY, value, updatedBy: ctx.actorId },
        update: { value, updatedBy: ctx.actorId },
      }),
      prisma.auditLog.create({
        data: {
          actorId: ctx.actorId,
          action: "PLATFORM_INFO_UPDATE",
          entityType: "PlatformSetting",
          entityId: PLATFORM_INFO_KEY,
          metadata: { ...input },
          ipAddress: ctx.ip,
          userAgent: ctx.ua,
        },
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[updatePlatformInfo] failed", err);
    return { ok: false };
  }
}
