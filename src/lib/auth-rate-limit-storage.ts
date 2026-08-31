import "server-only";

import { getRedis } from "@/lib/redis";

/**
 * Redis-backed `customStorage` for Better Auth's built-in rate limiter
 * (PRD §11.3). Replaces the default in-memory store so the auth-endpoint limits
 * (`/sign-in/email`, `/sign-up/email`, `/forget-password`, …) survive app
 * restarts/deploys and stay consistent — closing the "trigger a restart to reset
 * the brute-force window" gap.
 *
 * Backing selection mirrors `src/lib/rate-limit.ts`:
 *   - `RATE_LIMIT_REDIS_URL` set  → Redis (shared, restart-durable).
 *   - unset (dev)                 → in-memory net below (zero Redis setup).
 *
 * DEGRADATION POLICY (deliberate, NOT fail-open): if Redis is unreachable or a
 * command errors, we DO NOT skip limiting. We fall back to the in-memory net so
 * the same caps still apply per-process. The only weakening is that counts start
 * fresh at the moment Redis drops — still strictly limited, never unlimited.
 */

/** Better Auth's rate-limit record shape (`{ key, count, lastRequest }`). */
type RateLimitRecord = { key: string; count: number; lastRequest: number };

// TTL is for garbage collection ONLY: Better Auth resets the count itself by
// comparing `lastRequest` against the per-rule window, so this just stops idle
// keys from lingering. It MUST be ≥ the largest auth rule window (1h) so a key
// is never evicted *within* its window (which would hand back a fresh quota
// early). 2h gives headroom over the 1h `/forget-password` window.
const TTL_SECONDS = 2 * 60 * 60;
const REDIS_PREFIX = "ba:rl:";

// In-memory safety net — used ONLY while Redis is unavailable. Self-evicting via
// `expiresAt` (same idea as Better Auth's default memory store) so it can't leak.
const memory = new Map<string, { value: RateLimitRecord; expiresAt: number }>();

function memoryGet(key: string): RateLimitRecord | undefined {
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return hit.value;
}

function memorySet(key: string, value: RateLimitRecord): void {
  memory.set(key, { value, expiresAt: Date.now() + TTL_SECONDS * 1000 });
}

export const authRateLimitStorage = {
  async get(key: string): Promise<RateLimitRecord | null | undefined> {
    const redis = getRedis();
    if (!redis) return memoryGet(key);
    try {
      const raw = await redis.get(REDIS_PREFIX + key);
      return raw ? (JSON.parse(raw) as RateLimitRecord) : undefined;
    } catch (err) {
      console.error("[auth-rate-limit] redis get failed, using memory net:", err);
      return memoryGet(key);
    }
  },
  async set(key: string, value: RateLimitRecord): Promise<void> {
    const redis = getRedis();
    if (!redis) {
      memorySet(key, value);
      return;
    }
    try {
      await redis.set(REDIS_PREFIX + key, JSON.stringify(value), "EX", TTL_SECONDS);
    } catch (err) {
      console.error("[auth-rate-limit] redis set failed, using memory net:", err);
      memorySet(key, value);
    }
  },
};
