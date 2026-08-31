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

/** Better Auth's rate-limit record shape (`{ count, lastRequest }`). */
type RateLimitRecord = { count: number; lastRequest: number };

const REDIS_PREFIX = "ba:rl:";

// In-memory safety net — used ONLY while Redis is unavailable. Self-evicting via
// `expiresAt` (same idea as Better Auth's default memory store) so it can't leak.
const memory = new Map<string, { value: RateLimitRecord; expiresAt: number }>();

function memoryConsume(
  key: string,
  rule: { window: number; max: number },
): { allowed: boolean; retryAfter: number | null } {
  const now = Date.now();
  const windowMs = rule.window * 1000;
  const entry = memory.get(key);

  if (!entry || now - entry.value.lastRequest > windowMs || entry.expiresAt < now) {
    const record: RateLimitRecord = { count: 1, lastRequest: now };
    memory.set(key, { value: record, expiresAt: now + windowMs + 5000 });
    return { allowed: true, retryAfter: null };
  }

  if (entry.value.count < rule.max) {
    entry.value.count += 1;
    entry.expiresAt = now + windowMs + 5000;
    return { allowed: true, retryAfter: null };
  }

  const retryAfter = Math.max(1, Math.ceil((entry.value.lastRequest + windowMs - now) / 1000));
  return { allowed: false, retryAfter };
}

export const authRateLimitStorage = {
  async consume(
    key: string,
    rule: { window: number; max: number },
  ): Promise<{ allowed: boolean; retryAfter: number | null }> {
    const redis = getRedis();
    if (!redis) {
      return memoryConsume(key, rule);
    }

    try {
      const redisKey = REDIS_PREFIX + key;
      const now = Date.now();
      const windowMs = rule.window * 1000;
      const raw = await redis.get(redisKey);

      let record: RateLimitRecord | null = null;
      if (raw) {
        try {
          record = JSON.parse(raw);
        } catch {
          record = null;
        }
      }

      if (!record || now - record.lastRequest > windowMs) {
        const newRecord: RateLimitRecord = { count: 1, lastRequest: now };
        await redis.set(redisKey, JSON.stringify(newRecord), "EX", rule.window + 60);
        return { allowed: true, retryAfter: null };
      }

      if (record.count < rule.max) {
        record.count += 1;
        await redis.set(redisKey, JSON.stringify(record), "EX", rule.window + 60);
        return { allowed: true, retryAfter: null };
      }

      const retryAfter = Math.max(
        1,
        Math.ceil((record.lastRequest + windowMs - now) / 1000),
      );
      return { allowed: false, retryAfter };
    } catch (err) {
      console.error("[auth-rate-limit] redis consume failed, using memory net:", err);
      return memoryConsume(key, rule);
    }
  },
};
