import { NextResponse, type NextRequest } from "next/server";

import { VideoStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { BUNNY_STATUS, cdnPlaybackUrl, getBunnyVideo } from "@/lib/bunny-stream-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/bunny — Bunny Stream encoding notification (PRD §6.11.3).
 *
 * Bunny calls this URL as a video moves through its encoding pipeline, sending
 * `{ VideoLibraryId, VideoGuid, Status }`. We only act on terminal states:
 *   - FINISHED (4) → Video.status = READY + fill duration + videoUrl (playable).
 *   - ERROR (5) / UPLOAD_FAILED (6) → Video.status = FAILED.
 * Intermediate states (created/processing/transcoding) are acked and ignored.
 *
 * Authenticity comes from a shared `?secret=` (BUNNY_WEBHOOK_SECRET) since Bunny
 * does not sign these notifications. Idempotent: a Video already in a terminal
 * state is left untouched, so re-deliveries are no-ops.
 *
 * Always answers 200 for handled/ignored cases so Bunny stops retrying; only a
 * bad secret (401) or unexpected error (500 → Bunny retries) deviate.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.BUNNY_WEBHOOK_SECRET ?? "";
  const provided = request.nextUrl.searchParams.get("secret") ?? "";
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Bunny uses PascalCase keys; tolerate either casing defensively.
  const body = raw as { VideoGuid?: string; videoGuid?: string; Status?: number; status?: number };
  const guid = body.VideoGuid ?? body.videoGuid ?? "";
  const status = body.Status ?? body.status;
  if (!guid || typeof status !== "number") {
    return NextResponse.json({ error: "Missing VideoGuid/Status." }, { status: 400 });
  }

  try {
    const video = await prisma.video.findFirst({
      where: { bunnyVideoId: guid },
      select: { id: true, status: true },
    });

    // Unknown video (or webhook arrived before the step was saved) — ack so Bunny stops.
    if (!video) {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    // Idempotency: terminal states are final.
    if (video.status !== VideoStatus.PROCESSING) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (status === BUNNY_STATUS.FINISHED) {
      // Pull duration from the API (the webhook payload doesn't carry length).
      let durationSec = 0;
      try {
        durationSec = (await getBunnyVideo(guid)).durationSec;
      } catch (err) {
        console.warn("[bunny webhook] getVideo failed, saving duration=0", guid, err);
      }
      await prisma.video.update({
        where: { id: video.id },
        data: {
          status: VideoStatus.READY,
          duration: durationSec,
          videoUrl: cdnPlaybackUrl(guid),
          lastSyncedAt: new Date(),
        },
      });
    } else if (status === BUNNY_STATUS.ERROR || status === BUNNY_STATUS.UPLOAD_FAILED) {
      await prisma.video.update({
        where: { id: video.id },
        data: { status: VideoStatus.FAILED, lastSyncedAt: new Date() },
      });
    }
    // Intermediate states → leave as PROCESSING.

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    // 500 → Bunny retries, which is safe because the handler is idempotent.
    console.error("[bunny webhook] processing error", err);
    return NextResponse.json({ error: "Processing error." }, { status: 500 });
  }
}
