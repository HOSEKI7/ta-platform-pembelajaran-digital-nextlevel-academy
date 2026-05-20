/**
 * Browser-safe helpers for certificate id manipulation. Importable from both
 * Client and Server Components. The generator (`generate-certificate-no.ts`)
 * pulls in `node:crypto` and must stay server-only — the constants and pure
 * functions here are duplicated to keep client bundles clean.
 */

/**
 * Brand prefix prepended to every stored certificate number. The full value
 * (`NLA-XXXXXXXXXXXX`) is persisted to `certificate.certificateNo`; the
 * 12-character public id alone is what appears in the URL `/cert/...`.
 */
export const CERT_NO_PREFIX = "NLA-";

/** Matches the 12-character public id portion (A–Z, 0–9). */
export const CERT_PUBLIC_ID_REGEX = /^[A-Z0-9]{12}$/;

/**
 * Strips the `NLA-` brand prefix from a stored certificate number, returning
 * just the 12-character public id. Idempotent.
 */
export function publicIdFromCertificateNo(no: string): string {
  return no.startsWith(CERT_NO_PREFIX) ? no.slice(CERT_NO_PREFIX.length) : no;
}

/** Builds the full stored certificate number from a 12-character public id. */
export function certificateNoFromPublicId(id: string): string {
  return `${CERT_NO_PREFIX}${id}`;
}
