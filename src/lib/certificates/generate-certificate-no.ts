import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function todayWibYYYYMMDD(now: Date): string {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return formatted.replaceAll("-", "");
}

function randomSuffix(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/**
 * Produces one candidate certificate number — `NLA-YYYYMMDD-XXXXXXXX` —
 * using today's date in WIB (UTC+7) and 8 crypto-random characters from a
 * legibility-friendly alphabet (no 0/O/1/I). With 32^8 ≈ 1.1 trillion
 * combinations, a same-day collision is effectively impossible, but callers
 * still retry on `P2002` to be safe.
 */
export function generateCertificateNo(now: Date = new Date()): string {
  return `NLA-${todayWibYYYYMMDD(now)}-${randomSuffix()}`;
}
