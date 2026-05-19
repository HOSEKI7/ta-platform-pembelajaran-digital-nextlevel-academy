import "server-only";

import { prisma } from "@/lib/prisma";

export const CERTIFICATE_EXPIRY_YEARS_KEY = "CERTIFICATE_EXPIRY_YEARS";

/**
 * Reads the global `CERTIFICATE_EXPIRY_YEARS` setting and returns the
 * computed expiry date, or `null` for "no expiry" (PRD §6.6.2). Treats a
 * missing row, empty string, non-numeric value, or `<= 0` as "no expiry" so
 * the certificate stays valid indefinitely until an admin opts in.
 */
export async function computeCertExpiry(issuedAt: Date): Promise<Date | null> {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: CERTIFICATE_EXPIRY_YEARS_KEY },
    select: { value: true },
  });
  const raw = setting?.value?.trim() ?? "";
  if (raw.length === 0) return null;
  const years = Number(raw);
  if (!Number.isFinite(years) || years <= 0) return null;
  const d = new Date(issuedAt);
  d.setUTCFullYear(d.getUTCFullYear() + Math.floor(years));
  return d;
}
