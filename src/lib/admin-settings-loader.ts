import "server-only";

import { prisma } from "@/lib/prisma";
import {
  EMPTY_PLATFORM_INFO,
  type PlatformInfo,
} from "@/lib/validations/admin-platform-settings";

/**
 * Server loader for the admin "Pengaturan" page (PRD §6.11.11).
 *
 * Reads the platform-info blob stored under the `PLATFORM_INFO` key in
 * `platform_setting`. The integration *status* is NOT loaded here — it's
 * served by a separate live-ping endpoint (`/api/admin/settings/integration-status`)
 * so the SSR page render stays fast and isn't blocked on outbound HTTP calls.
 */

export const PLATFORM_INFO_KEY = "PLATFORM_INFO";

/** Merge stored (possibly partial / legacy) JSON onto the empty baseline so the
 *  form always receives every field as a string. Never throws on bad JSON. */
function coercePlatformInfo(raw: string | null | undefined): PlatformInfo {
  if (!raw) return { ...EMPTY_PLATFORM_INFO };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...EMPTY_PLATFORM_INFO };
  }
  if (typeof parsed !== "object" || parsed === null) {
    return { ...EMPTY_PLATFORM_INFO };
  }
  const obj = parsed as Record<string, unknown>;
  const pick = (key: keyof PlatformInfo): string => {
    const v = obj[key];
    return typeof v === "string" ? v : "";
  };
  return {
    namaPlatform: pick("namaPlatform"),
    tagline: pick("tagline"),
    deskripsi: pick("deskripsi"),
    emailKontak: pick("emailKontak"),
    nomorWhatsapp: pick("nomorWhatsapp"),
    alamat: pick("alamat"),
    kota: pick("kota"),
    negara: pick("negara"),
    jamOperasional: pick("jamOperasional"),
  };
}

export async function loadPlatformInfo(): Promise<PlatformInfo> {
  const row = await prisma.platformSetting.findUnique({
    where: { key: PLATFORM_INFO_KEY },
    select: { value: true },
  });
  return coercePlatformInfo(row?.value);
}
