import "server-only";

import { VideoStatus } from "@/generated/prisma";
import { BUNNY_STATUS, cdnPlaybackUrl, getBunnyVideo, isBunnyStreamAdminConfigured } from "@/lib/bunny-stream-admin";
import { prisma } from "@/lib/prisma";

/**
 * Fallback self-heal for video durations. The Bunny encoding webhook is the
 * primary source of truth (it fills `duration`/`status` when encoding finishes),
 * but if it never reaches us — e.g. local dev without a public URL — rows stay
 * at `duration = 0` forever. This reconciles such rows lazily from the loader.
 *
 * Meant to run inside `after()` (non-blocking, never gates the render). A
 * `lastSyncedAt` cooldown stops us from hammering Bunny on every page load for a
 * video that is legitimately still 0 (e.g. mid-encode or genuinely zero-length).
 */

const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export type SelfHealCandidate = {
  id: string;
  bunnyVideoId: string;
  duration: number;
  lastSyncedAt: Date | null;
};

export async function selfHealVideoDurations(videos: SelfHealCandidate[]): Promise<void> {
  if (!isBunnyStreamAdminConfigured()) return;

  const nowMs = Date.now();
  const candidates = videos.filter(
    (v) =>
      v.bunnyVideoId &&
      (v.duration === 0 || v.duration == null) &&
      (v.lastSyncedAt == null || nowMs - v.lastSyncedAt.getTime() > SYNC_COOLDOWN_MS),
  );

  for (const v of candidates) {
    try {
      const { status, durationSec } = await getBunnyVideo(v.bunnyVideoId);
      const nextStatus =
        status === BUNNY_STATUS.FINISHED
          ? VideoStatus.READY
          : status === BUNNY_STATUS.ERROR || status === BUNNY_STATUS.UPLOAD_FAILED
            ? VideoStatus.FAILED
            : null; // intermediate — leave as-is

      await prisma.video.update({
        where: { id: v.id },
        data: {
          duration: durationSec,
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(status === BUNNY_STATUS.FINISHED ? { videoUrl: cdnPlaybackUrl(v.bunnyVideoId) } : {}),
          // Always stamp — even when still 0 — so the cooldown applies and we
          // don't re-hit Bunny for the same un-finished video on every load.
          lastSyncedAt: new Date(),
        },
      });
    } catch (err) {
      // Best-effort: a single failed video must never break the player load.
      console.warn(`[course-player self-heal] sync failed for ${v.bunnyVideoId}:`, err);
    }
  }
}
