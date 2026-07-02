import "server-only";

import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

/**
 * Bunny.net **Stream** admin helpers — server-side video lifecycle management
 * for the admin "Tambah/Edit Kursus" flow. Distinct from `src/lib/bunny.ts`
 * (which only signs *playback* iframe embeds for the course player).
 *
 * Upload flow (PRD §6.11.3, direct browser → Bunny, never through our server):
 *   1. Server `createBunnyVideo(title)` → POST .../videos → returns a video GUID.
 *   2. Server `signTusUpload(guid)` → SHA256 signature + expiry.
 *   3. Browser uploads the file straight to Bunny via TUS with those headers.
 *   4. Browser sends the GUID back; we persist a Video row (status PROCESSING).
 *   5. Bunny's encoding webhook flips status → READY and fills duration/videoUrl.
 *
 * Requires `BUNNY_STREAM_API_KEY` (Stream → Settings → API). Without it these
 * helpers throw with a clear message — there is no dev fallback because there is
 * no way to fake a real Bunny video object.
 */

const LIB_ID = process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const API_KEY = process.env.BUNNY_STREAM_API_KEY ?? "";
const CDN_HOST = process.env.BUNNY_STREAM_CDN_HOSTNAME ?? "";

const STREAM_API_BASE = "https://video.bunnycdn.com";
/** TUS resumable upload endpoint (same for every library). */
export const BUNNY_TUS_ENDPOINT = `${STREAM_API_BASE}/tusupload`;

/** Default signed-upload validity. 6h — plenty for a 500 MB upload on slow links. */
const DEFAULT_UPLOAD_TTL_SEC = 60 * 60 * 6;

/** Bunny encoding status codes (numeric `status` field on the video object). */
export const BUNNY_STATUS = {
  CREATED: 0,
  UPLOADED: 1,
  PROCESSING: 2,
  TRANSCODING: 3,
  FINISHED: 4,
  ERROR: 5,
  UPLOAD_FAILED: 6,
} as const;

export function isBunnyStreamAdminConfigured(): boolean {
  return Boolean(LIB_ID && API_KEY);
}

function assertConfigured(): void {
  if (!isBunnyStreamAdminConfigured()) {
    throw new Error(
      "Bunny Stream belum dikonfigurasi (BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY).",
    );
  }
}

export type CreatedBunnyVideo = { guid: string; libraryId: string };

/** Create an empty video on Bunny, optionally inside a collection. */
export async function createBunnyVideo(
  title: string,
  collectionId?: string,
): Promise<CreatedBunnyVideo> {
  assertConfigured();
  const res = await fetch(`${STREAM_API_BASE}/library/${LIB_ID}/videos`, {
    method: "POST",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: title.slice(0, 200),
      ...(collectionId ? { collectionId } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Bunny createVideo gagal: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { guid?: string };
  if (!json.guid) {
    throw new Error("Bunny createVideo: respons tanpa GUID.");
  }
  return { guid: json.guid, libraryId: LIB_ID };
}

export type TusUploadAuth = {
  libraryId: string;
  videoId: string;
  signature: string;
  expires: number;
  endpoint: string;
};

/**
 * Build the TUS authorization headers for a direct browser upload.
 * signature = SHA256_hex(libraryId + apiKey + expires + videoGuid)
 * `expires` is a UNIX timestamp in **seconds**.
 */
export function signTusUpload(videoGuid: string, ttlSec = DEFAULT_UPLOAD_TTL_SEC): TusUploadAuth {
  assertConfigured();
  if (!videoGuid) throw new Error("signTusUpload: videoGuid wajib diisi.");
  const expires = Math.floor(Date.now() / 1000) + ttlSec;
  const signature = createHash("sha256")
    .update(`${LIB_ID}${API_KEY}${expires}${videoGuid}`)
    .digest("hex");
  return { libraryId: LIB_ID, videoId: videoGuid, signature, expires, endpoint: BUNNY_TUS_ENDPOINT };
}

export type BunnyVideoDetails = { status: number; durationSec: number };

/** Fetch a video's encoding status + duration (used by the webhook handler). */
export async function getBunnyVideo(videoGuid: string): Promise<BunnyVideoDetails> {
  assertConfigured();
  const res = await fetch(`${STREAM_API_BASE}/library/${LIB_ID}/videos/${videoGuid}`, {
    headers: { AccessKey: API_KEY, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Bunny getVideo gagal: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { status?: number; length?: number };
  return { status: json.status ?? 0, durationSec: json.length ?? 0 };
}

/** Best-effort delete of a Bunny video; never throws (used on step delete/rollback). */
export async function deleteBunnyVideo(videoGuid: string): Promise<void> {
  if (!isBunnyStreamAdminConfigured() || !videoGuid) return;
  try {
    await fetch(`${STREAM_API_BASE}/library/${LIB_ID}/videos/${videoGuid}`, {
      method: "DELETE",
      headers: { AccessKey: API_KEY },
    });
  } catch (err) {
    console.warn("[bunny-stream-admin] delete failed", videoGuid, err);
  }
}

/** CDN HLS playback URL for a finished video (stored as Video.videoUrl metadata). */
export function cdnPlaybackUrl(videoGuid: string): string | null {
  if (!CDN_HOST) return null;
  return `https://${CDN_HOST}/${videoGuid}/playlist.m3u8`;
}

export type CreatedCollection = { guid: string };

/** Create a named collection inside the Stream library. */
export async function createBunnyCollection(name: string): Promise<CreatedCollection> {
  assertConfigured();
  const res = await fetch(`${STREAM_API_BASE}/library/${LIB_ID}/collections`, {
    method: "POST",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name: name.slice(0, 100) }),
  });
  if (!res.ok) {
    throw new Error(`Bunny createCollection gagal: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { guid?: string };
  if (!json.guid) {
    throw new Error("Bunny createCollection: respons tanpa GUID.");
  }
  return { guid: json.guid };
}

/**
 * Lazy get-or-create a Bunny Stream collection for a course.
 * Creates one on first video upload, then caches the GUID on the Course row.
 * Uses pg_advisory_xact_lock to prevent concurrent double-creation.
 */
export async function getOrCreateCollection(courseId: string): Promise<string> {
  assertConfigured();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { bunnyCollectionId: true, title: true },
  });
  if (!course) throw new Error(`Course ${courseId} tidak ditemukan.`);
  if (course.bunnyCollectionId) return course.bunnyCollectionId;

  return prisma.$transaction(async (tx) => {
    // ponytail: global advisory lock per course — prevents concurrent double-creation.
    // Per-course key is narrow enough; no per-account upgrade needed.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'collection:' + courseId})::int8)`;

    const locked = await tx.course.findUnique({
      where: { id: courseId },
      select: { bunnyCollectionId: true, title: true },
    });
    if (locked?.bunnyCollectionId) return locked.bunnyCollectionId;

    const { guid } = await createBunnyCollection(locked?.title ?? course.title);
    await tx.course.update({
      where: { id: courseId },
      data: { bunnyCollectionId: guid },
    });
    return guid;
  });
}

/**
 * Move an existing video into a collection (used by backfill).
 */
export async function setVideoCollection(videoGuid: string, collectionId: string): Promise<void> {
  assertConfigured();
  const res = await fetch(`${STREAM_API_BASE}/library/${LIB_ID}/videos/${videoGuid}`, {
    method: "POST",
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ collectionId }),
  });
  if (!res.ok) {
    throw new Error(`Bunny setVideoCollection gagal: ${res.status} ${res.statusText}`);
  }
}
