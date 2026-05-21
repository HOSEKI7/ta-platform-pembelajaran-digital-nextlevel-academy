import "server-only";

import { createHash } from "node:crypto";

/**
 * Bunny.net Stream helpers — generates iframe embed URLs that the Course
 * Player consumes. We use Stream (NOT Storage) for video because Stream
 * provides adaptive HLS transcoding, signed playback tokens, and a hosted
 * iframe player. See `.env.example` for the setup instructions.
 *
 * Token signing follows Bunny's documented formula for Stream Token
 * Authentication:
 *
 *   token = sha256_hex( token_auth_key + video_guid + expires )
 *   url   = https://iframe.mediadelivery.net/embed/{libId}/{guid}
 *           ?autoplay=false&token={token}&expires={expires}
 *
 * If `BUNNY_STREAM_TOKEN_AUTH_KEY` is empty (Token Authentication disabled
 * on the library), the helper returns the URL without a token — useful for
 * local development before enabling token auth.
 */

const LIB_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_AUTH_KEY ?? "";

const DEFAULT_EXPIRES_SEC = 60 * 60 * 4; // 4 hours — plenty for a study session

export type SignBunnyOpts = {
  /** Seconds from now until the signed token expires. Default 4 hours. */
  expiresInSec?: number;
  /** Optional: bind token to a specific viewer IP for stricter protection. */
  ip?: string;
};

export function isBunnyConfigured(): boolean {
  return Boolean(LIB_ID);
}

export function signBunnyEmbedUrl(videoGuid: string, opts?: SignBunnyOpts): string {
  if (!LIB_ID) {
    throw new Error(
      "BUNNY_STREAM_LIBRARY_ID is not set — cannot build embed URL. " +
        "Fill in .env.local with your Bunny Stream library details.",
    );
  }
  if (!videoGuid) {
    throw new Error("signBunnyEmbedUrl: videoGuid is required.");
  }

  const base = `https://iframe.mediadelivery.net/embed/${LIB_ID}/${videoGuid}`;
  const params = new URLSearchParams({ autoplay: "false" });

  if (!TOKEN_KEY) {
    return `${base}?${params.toString()}`;
  }

  const expires = Math.floor(Date.now() / 1000) + (opts?.expiresInSec ?? DEFAULT_EXPIRES_SEC);
  const hashInput = `${TOKEN_KEY}${videoGuid}${expires}${opts?.ip ?? ""}`;
  const token = createHash("sha256").update(hashInput).digest("hex");

  params.set("token", token);
  params.set("expires", String(expires));
  return `${base}?${params.toString()}`;
}
