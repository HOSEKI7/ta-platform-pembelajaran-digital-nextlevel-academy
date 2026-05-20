import "server-only";

import { randomBytes } from "node:crypto";

import {
  CERT_NO_PREFIX,
  CERT_PUBLIC_ID_REGEX,
  certificateNoFromPublicId,
  publicIdFromCertificateNo,
} from "@/lib/certificates/cert-id";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ID_LENGTH = 12;

function randomId(): string {
  const bytes = randomBytes(ID_LENGTH);
  let out = "";
  for (let i = 0; i < ID_LENGTH; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/**
 * Produces one candidate certificate number — `NLA-XXXXXXXXXXXX` — using
 * 12 crypto-random characters from the full base-36 alphabet (A–Z + 0–9).
 * Search space is 36^12 ≈ 4.7 × 10¹⁸; collisions are effectively impossible,
 * but the claim handler still retries on `P2002` as a safety net.
 */
export function generateCertificateNo(): string {
  return `${CERT_NO_PREFIX}${randomId()}`;
}

// Re-exports so existing callers can keep importing from this module without
// chasing a new path. New code should prefer `@/lib/certificates/cert-id`.
export {
  CERT_NO_PREFIX,
  CERT_PUBLIC_ID_REGEX,
  certificateNoFromPublicId,
  publicIdFromCertificateNo,
};
