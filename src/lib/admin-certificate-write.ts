import "server-only";

import { prisma } from "@/lib/prisma";
import { CERTIFICATE_EXPIRY_YEARS_KEY } from "@/lib/certificates/cert-expiry";
import type { CertExpirySettingInput } from "@/lib/validations/admin-certificate";

/**
 * Admin-side write for the Certificate Management surface (PRD §6.11.7).
 *
 * The certificate table itself is read-only for admins — the only mutation is
 * the global expiry config. Stored as a `platform_setting` row keyed by
 * `CERTIFICATE_EXPIRY_YEARS` (read by `computeCertExpiry` at claim time). The
 * change is NON-RETROACTIVE: it only affects certificates issued afterward;
 * already-issued certificates keep their stamped `expiresAt`.
 */

export type AdminActionContext = {
  actorId: string;
  ip: string | null;
  ua: string | null;
};

/**
 * Upserts the global expiry setting. `years = null` writes an empty string
 * ("no expiry" — same sentinel `computeCertExpiry` already treats as such).
 * Records the change in `AuditLog` within the same transaction.
 */
export async function updateCertExpirySetting(
  input: CertExpirySettingInput,
  ctx: AdminActionContext,
): Promise<{ ok: true } | { ok: false }> {
  const value = input.years == null ? "" : String(input.years);

  try {
    await prisma.$transaction([
      prisma.platformSetting.upsert({
        where: { key: CERTIFICATE_EXPIRY_YEARS_KEY },
        create: {
          key: CERTIFICATE_EXPIRY_YEARS_KEY,
          value,
          updatedBy: ctx.actorId,
        },
        update: { value, updatedBy: ctx.actorId },
      }),
      prisma.auditLog.create({
        data: {
          actorId: ctx.actorId,
          action: "CERT_EXPIRY_UPDATE",
          entityType: "PlatformSetting",
          entityId: CERTIFICATE_EXPIRY_YEARS_KEY,
          metadata: { years: input.years },
          ipAddress: ctx.ip,
          userAgent: ctx.ua,
        },
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[updateCertExpirySetting] failed", err);
    return { ok: false };
  }
}
