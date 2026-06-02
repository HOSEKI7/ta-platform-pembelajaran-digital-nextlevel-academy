import "server-only";

/**
 * Bunny.net **Storage** helper for certificate PNGs — deliberately separate from
 * `bunny-storage.ts` (private blobs with token auth). Certificates are public
 * proof documents, so they live in their own storage + pull zone with Token
 * Authentication turned OFF. That lets us store a permanent, tokenless CDN URL
 * in the DB and render it as a plain `<img>` / embed it anywhere — links never
 * expire. Enumeration is prevented by the high-entropy public id in the path,
 * and authenticity is always verified from the DB, never from file existence.
 *
 *   Upload: PUT https://<endpoint>/<zone>/certificates/<publicId>.png
 *   Read:   https://<pullzone>/certificates/<publicId>.png  (no token)
 *
 * PUT overwrites, so retries/regenerations never create orphan duplicates.
 */

const ZONE = process.env.BUNNY_CERT_STORAGE_ZONE_NAME ?? "";
const ACCESS_KEY = process.env.BUNNY_CERT_STORAGE_ACCESS_KEY ?? "";
const REGION = process.env.BUNNY_CERT_STORAGE_REGION ?? "";
const PULL_ZONE = process.env.BUNNY_CERT_PULL_ZONE ?? "";

/** Region prefix → endpoint hostname. Falkenstein (default) has no prefix. */
function storageEndpoint(): string {
  return REGION ? `${REGION}.storage.bunnycdn.com` : "storage.bunnycdn.com";
}

export function isCertStorageConfigured(): boolean {
  return Boolean(ZONE && ACCESS_KEY && PULL_ZONE);
}

/** Stable object path for a certificate's PNG, keyed by its public id. */
export function certificateObjectPath(publicId: string): string {
  return `certificates/${publicId}.png`;
}

/** Permanent public CDN URL for a certificate PNG (no token, immutable file). */
export function certificatePublicUrl(publicId: string): string {
  return `https://${PULL_ZONE}/${certificateObjectPath(publicId)}`;
}

/**
 * Uploads (overwriting) the certificate PNG and returns its permanent public
 * CDN URL. Throws if the cert storage zone isn't configured — callers decide
 * whether to swallow that (background render) or surface it.
 */
export async function uploadCertificatePng(
  publicId: string,
  png: Buffer | Uint8Array,
): Promise<string> {
  if (!isCertStorageConfigured()) {
    throw new Error(
      "Bunny cert storage belum dikonfigurasi (BUNNY_CERT_STORAGE_ZONE_NAME / _ACCESS_KEY / BUNNY_CERT_PULL_ZONE).",
    );
  }
  const url = `https://${storageEndpoint()}/${ZONE}/${certificateObjectPath(publicId)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: ACCESS_KEY,
      "Content-Type": "image/png",
      // Immutable: the file for a given public id never changes content.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body: Buffer.from(png),
  });
  if (!res.ok) {
    throw new Error(
      `Bunny cert upload gagal: ${res.status} ${res.statusText}`,
    );
  }
  return certificatePublicUrl(publicId);
}
