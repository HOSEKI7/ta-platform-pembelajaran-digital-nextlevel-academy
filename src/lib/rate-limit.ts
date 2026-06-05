import "server-only";

import { NextResponse } from "next/server";
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
  type RateLimiterAbstract,
} from "rate-limiter-flexible";

import { getRedis } from "@/lib/redis";

/**
 * Rate limiting for abuse-sensitive Route Handlers (PRD §11.3) — an extra layer
 * ON TOP of the existing session, advisory-lock and double-purchase guards.
 *
 * Backend is chosen automatically by `RATE_LIMIT_REDIS_URL`:
 *   - unset  → `RateLimiterMemory` (zero-setup dev; still meaningful on the VPS
 *     since the Node process is long-lived).
 *   - set    → `RateLimiterRedis` over the shared self-hosted connection, so the
 *     limit is consistent across instances.
 *
 * Fail-open by design: a genuine quota hit rejects with a `RateLimiterRes` (→
 * 429), but a store error (Redis down/unreachable) is swallowed and the request
 * is ALLOWED. Infrastructure problems must never block a legitimate purchase.
 * The Midtrans webhook is intentionally NOT limited (authenticated by signature).
 *
 * Keyed by `userId` (both limited endpoints require a session) rather than IP,
 * so we don't have to trust `X-Forwarded-For` behind the VPS reverse proxy.
 */

type LimiterConfig = {
  keyPrefix: string;
  /** Max requests allowed within the window. */
  points: number;
  /** Window length in seconds. */
  durationSec: number;
};

function buildLimiter(config: LimiterConfig): RateLimiterAbstract {
  const redis = getRedis();
  if (redis) {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: config.keyPrefix,
      points: config.points,
      duration: config.durationSec,
      // Reject immediately if Redis isn't ready so consumeRateLimit can fail open
      // fast instead of waiting on a dead connection.
      rejectIfRedisNotReady: true,
    });
  }
  return new RateLimiterMemory({
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.durationSec,
  });
}

// Singletons (hot-reload guarded). Limits are deliberately loose so normal
// manual testing never trips a 429; they exist to cap abuse, not usage.
const globalForLimiters = globalThis as unknown as {
  orderRateLimiter?: RateLimiterAbstract;
  voucherRateLimiter?: RateLimiterAbstract;
  adminInviteRateLimiter?: RateLimiterAbstract;
  adminInviteAcceptRateLimiter?: RateLimiterAbstract;
};

/** Order creation — heaviest side effects (Midtrans Snap + Resend email + DB). */
export const orderRateLimiter: RateLimiterAbstract =
  globalForLimiters.orderRateLimiter ??
  (globalForLimiters.orderRateLimiter = buildLimiter({
    keyPrefix: "rl:order",
    points: 12,
    durationSec: 60,
  }));

/** Voucher validation — brute-forceable (code enumeration). */
export const voucherRateLimiter: RateLimiterAbstract =
  globalForLimiters.voucherRateLimiter ??
  (globalForLimiters.voucherRateLimiter = buildLimiter({
    keyPrefix: "rl:voucher",
    points: 30,
    durationSec: 60,
  }));

/** Admin invite creation — sends email + writes DB (keyed by inviting admin). */
export const adminInviteRateLimiter: RateLimiterAbstract =
  globalForLimiters.adminInviteRateLimiter ??
  (globalForLimiters.adminInviteRateLimiter = buildLimiter({
    keyPrefix: "rl:admin-invite",
    points: 10,
    durationSec: 60 * 60,
  }));

/** Public invite acceptance — token guessing is the abuse vector (keyed by IP). */
export const adminInviteAcceptRateLimiter: RateLimiterAbstract =
  globalForLimiters.adminInviteAcceptRateLimiter ??
  (globalForLimiters.adminInviteAcceptRateLimiter = buildLimiter({
    keyPrefix: "rl:admin-invite-accept",
    points: 20,
    durationSec: 60 * 10,
  }));

export type RateLimitOutcome =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

/**
 * Consumes one point for `key`. Returns `{ allowed: false, retryAfterSec }` only
 * on a real quota exhaustion; any store error fails open (`allowed: true`).
 */
export async function consumeRateLimit(
  limiter: RateLimiterAbstract,
  key: string,
): Promise<RateLimitOutcome> {
  try {
    await limiter.consume(key, 1);
    return { allowed: true };
  } catch (rejected) {
    if (rejected instanceof RateLimiterRes) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil(rejected.msBeforeNext / 1000)),
      };
    }
    // Store error (e.g. Redis unreachable) → allow. Never block on infra.
    console.error("[rate-limit] store error, failing open:", rejected);
    return { allowed: true };
  }
}

/** Standard 429 response (Bahasa Indonesia) with a `Retry-After` header. */
export function tooManyRequestsResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    {
      error: `Terlalu banyak permintaan. Silakan coba lagi dalam ${retryAfterSec} detik.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
