/**
 * One-off backfill: reconcile every Video's `duration` + `status` from Bunny
 * Stream. Needed because the encoding webhook never reached some environments
 * (e.g. local dev without ngrok), leaving rows stuck at `duration = 0` /
 * `status = PROCESSING` even though Bunny finished encoding long ago.
 *
 * For every Video with `duration === 0` we ask Bunny for the real video object
 * and write back `length` (seconds) + the mapped status + the CDN playback URL,
 * stamping `lastSyncedAt`. Idempotent — safe to re-run; rows already filled are
 * skipped by the `duration === 0` filter.
 *
 * `src/lib/bunny-stream-admin.ts` is `import "server-only"`, so it cannot be
 * imported from a tsx script. The tiny Stream getVideo fetch is re-implemented
 * inline here (same approach `scripts/verify-bunny.ts` takes for signing).
 *
 * Run with:  npx tsx scripts/sync-video-durations.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, VideoStatus } from "../src/generated/prisma";

const LIB_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const API_KEY = process.env.BUNNY_STREAM_API_KEY ?? "";
const CDN_HOST = process.env.BUNNY_STREAM_CDN_HOSTNAME ?? "";

// Bunny encoding status codes (numeric `status` on the video object).
const BUNNY_FINISHED = 4;
const BUNNY_ERROR = 5;
const BUNNY_UPLOAD_FAILED = 6;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

type BunnyVideo = { status: number; length: number };

async function getBunnyVideo(guid: string): Promise<BunnyVideo> {
  const res = await fetch(`https://video.bunnycdn.com/library/${LIB_ID}/videos/${guid}`, {
    headers: { AccessKey: API_KEY, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Bunny getVideo gagal: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { status?: number; length?: number };
  return { status: json.status ?? 0, length: json.length ?? 0 };
}

function cdnPlaybackUrl(guid: string): string | null {
  if (!CDN_HOST) return null;
  return `https://${CDN_HOST}/${guid}/playlist.m3u8`;
}

async function main() {
  if (!LIB_ID || !API_KEY) {
    throw new Error(
      "Bunny Stream belum dikonfigurasi (BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY).",
    );
  }

  const videos = await db.video.findMany({
    where: { duration: 0 },
    select: { id: true, bunnyVideoId: true },
  });

  console.log(`Ditemukan ${videos.length} video dengan duration = 0.`);
  let updated = 0;
  let skipped = 0;

  for (const v of videos) {
    try {
      const { status, length } = await getBunnyVideo(v.bunnyVideoId);
      const nextStatus =
        status === BUNNY_FINISHED
          ? VideoStatus.READY
          : status === BUNNY_ERROR || status === BUNNY_UPLOAD_FAILED
            ? VideoStatus.FAILED
            : null; // intermediate — leave as-is

      await db.video.update({
        where: { id: v.id },
        data: {
          duration: length,
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(status === BUNNY_FINISHED ? { videoUrl: cdnPlaybackUrl(v.bunnyVideoId) } : {}),
          lastSyncedAt: new Date(),
        },
      });

      if (length > 0) {
        updated += 1;
        console.log(`✓ ${v.bunnyVideoId} → ${length}s (status ${status})`);
      } else {
        skipped += 1;
        console.log(`· ${v.bunnyVideoId} masih 0s (status ${status}) — dilewati`);
      }
    } catch (err) {
      skipped += 1;
      console.warn(`✗ ${v.bunnyVideoId} gagal:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`Selesai. Diperbarui: ${updated}, dilewati/gagal: ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
