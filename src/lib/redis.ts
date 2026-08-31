import "server-only";

import Redis from "ioredis";

/**
 * Single, reusable ioredis connection for rate limiting (PRD §11.3).
 *
 * Self-hosted Redis only — enabled by setting `RATE_LIMIT_REDIS_URL`. When the
 * var is empty (the default, e.g. a fresh clone), this returns `null` and the
 * rate limiter falls back to an in-memory store so `npm run dev` works with zero
 * Redis setup on any OS.
 *
 * Tuned to FAIL FAST when Redis is unreachable so requests never hang waiting on
 * a dead store: the offline queue is disabled and retries are capped, so a
 * command rejects immediately and the caller can fail open (see rate-limit.ts).
 *
 * Cached on `globalThis` so Turbopack/Fast-Refresh hot reloads reuse the one
 * connection instead of leaking sockets (same guard pattern as the Prisma
 * client). `undefined` = not yet resolved; `null` = resolved to "no Redis".
 */
const globalForRedis = globalThis as unknown as {
  rateLimitRedis?: Redis | null;
};

export function getRedis(): Redis | null {
  if (globalForRedis.rateLimitRedis !== undefined) {
    return globalForRedis.rateLimitRedis;
  }

  const url = process.env.RATE_LIMIT_REDIS_URL?.trim();
  if (!url) {
    globalForRedis.rateLimitRedis = null;
    return null;
  }

  const client = new Redis(url, {
    // Reject commands instantly while disconnected instead of queueing them —
    // this is what makes fail-open fast rather than a hung request.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    // Keep trying to reconnect in the background (capped) without ever throwing
    // at the process level.
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  client.on("error", (err) => {
    // Never let a Redis hiccup crash the process; the limiter fails open.
    console.error("[redis] connection error:", err.message);
  });

  globalForRedis.rateLimitRedis = client;
  return client;
}
