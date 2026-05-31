import "server-only";

import { createHash } from "node:crypto";

/**
 * Bunny.net **Storage** helpers — distinct from `src/lib/bunny.ts` (which is
 * for Bunny **Stream/video**). Used to persist file blobs that don't belong
 * in Postgres (task submissions, mentor attachments). Postgres holds the
 * object path/metadata; the binary lives here.
 *
 * Why Bunny rather than Supabase Storage? Supabase Free is capped at 1 GB and
 * the project already uses Bunny for video — using it for blobs too keeps the
 * vendor split clean ("data in Postgres, files in Bunny") and cheap at scale.
 *
 * Layout:
 *   submissions/<taskId>/<studentId>/<timestamp>-<sanitized>.<ext>
 *   task-attachments/<taskId>/<sanitized>.<ext>
 *
 * Upload: PUT https://<endpoint>/<zone>/<path> with `AccessKey` header.
 * Read:   signed URL on a Pull Zone with Token Authentication enabled.
 *
 *   token = base64url( sha256_raw( token_auth_key + path + expires ) )
 *   url   = https://<pullzone>/<path>?token=<token>&expires=<expires>
 *
 * If `BUNNY_STORAGE_TOKEN_AUTH_KEY` is empty (token auth disabled in dev), the
 * helper returns the URL without a token — mirrors `bunny.ts` for parity.
 */

const ZONE = process.env.BUNNY_STORAGE_ZONE_NAME ?? "";
const ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY ?? "";
const REGION = process.env.BUNNY_STORAGE_REGION ?? "";
const PULL_ZONE = process.env.BUNNY_STORAGE_PULL_ZONE ?? "";
const TOKEN_KEY = process.env.BUNNY_STORAGE_TOKEN_AUTH_KEY ?? "";

const DEFAULT_EXPIRES_SEC = 60 * 60; // 1 hour — plenty for a download click

/** Region prefix → endpoint hostname. Falkenstein (default) has no prefix. */
function storageEndpoint(): string {
  return REGION ? `${REGION}.storage.bunnycdn.com` : "storage.bunnycdn.com";
}

export function isBunnyStorageConfigured(): boolean {
  return Boolean(ZONE && ACCESS_KEY);
}

export function isBunnyPullZoneConfigured(): boolean {
  return Boolean(PULL_ZONE);
}

export function isExternalUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

/** Strip path traversal + non-safe chars; keep extension. */
function sanitizeFileName(name: string): string {
  const trimmed = name.replace(/^.*[\\/]/, "").trim();
  // Keep alphanumerics, dot, underscore, dash; collapse anything else to underscore.
  const cleaned = trimmed.replace(/[^a-zA-Z0-9._-]+/g, "_");
  // Avoid leading dot / empty.
  return cleaned.length > 0 && cleaned[0] !== "." ? cleaned : `file_${cleaned}`;
}

type UploadResult = {
  objectPath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
};

async function putToBunny(objectPath: string, file: File): Promise<void> {
  if (!isBunnyStorageConfigured()) {
    throw new Error(
      "Bunny Storage belum dikonfigurasi (BUNNY_STORAGE_ZONE_NAME / BUNNY_STORAGE_ACCESS_KEY).",
    );
  }
  const url = `https://${storageEndpoint()}/${ZONE}/${objectPath}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: ACCESS_KEY,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: buffer,
  });
  if (!res.ok) {
    throw new Error(`Bunny upload gagal: ${res.status} ${res.statusText}`);
  }
}

/** Upload a peserta-magang submission file. Returns the stored object path. */
export async function uploadTaskFile(opts: {
  taskId: string;
  studentId: string;
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `submissions/${opts.taskId}/${opts.studentId}/${Date.now()}-${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

/** Upload a mentor-side task attachment. Provided for seed scripts and the
 *  future mentor UI; not called from the magang flow. */
export async function uploadMentorAttachment(opts: {
  taskId: string;
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `task-attachments/${opts.taskId}/${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

// ---- Mentor task creation uploads (mentor-scoped paths) ---------------------
// The task doesn't exist yet when these run (id chicken-and-egg), so they key
// by mentorId — same as submissions key by studentId. The stored object path
// goes into the DB and is signed on read; the folder name is incidental.

/** Allowed inline-image types for the rich-text description editor. */
export const TASK_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const TASK_IMAGE_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

/** Upload a single inline image pasted/dropped in the description editor. */
export async function uploadTaskImage(opts: {
  mentorId: string;
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `task-images/${opts.mentorId}/${Date.now()}-${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

/** Upload the mentor's supporting attachment (PDF/DOCX/ZIP) for a new task. */
export async function uploadTaskAttachment(opts: {
  mentorId: string;
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `task-attachments/${opts.mentorId}/${Date.now()}-${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

// ---- Admin course-creation uploads (admin-scoped paths) ---------------------
// The course doesn't exist yet on the /new submit (id chicken-and-egg), so these
// key by adminId + timestamp — same rationale as the mentor task uploads above.
// The stored object path goes into the DB and is signed on read.

/** Upload a course thumbnail or instructor photo (PRD §6.11.3 Form Kursus). */
export async function uploadCourseAsset(opts: {
  adminId: string;
  kind: "thumbnail" | "instructor";
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `course-assets/${opts.kind}/${opts.adminId}/${Date.now()}-${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

/** Upload a single quiz-question image (PRD §6.11.3 Form Tahap Quiz). */
export async function uploadQuizImage(opts: {
  adminId: string;
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `quiz-images/${opts.adminId}/${Date.now()}-${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

/** Upload a single badge icon (PRD §6.11.8). Admin-scoped path; signed on read. */
export async function uploadBadgeIcon(opts: {
  adminId: string;
  file: File;
}): Promise<UploadResult> {
  const sanitized = sanitizeFileName(opts.file.name);
  const objectPath = `badge-icons/${opts.adminId}/${Date.now()}-${sanitized}`;
  await putToBunny(objectPath, opts.file);
  return {
    objectPath,
    fileName: sanitized,
    fileSize: opts.file.size,
    contentType: opts.file.type || "application/octet-stream",
  };
}

/** Best-effort delete; never throws (used for rollback / replacement). */
export async function removeBunnyFile(objectPath: string): Promise<void> {
  if (!isBunnyStorageConfigured() || !objectPath) return;
  try {
    const url = `https://${storageEndpoint()}/${ZONE}/${objectPath}`;
    await fetch(url, {
      method: "DELETE",
      headers: { AccessKey: ACCESS_KEY },
    });
  } catch (err) {
    console.warn("[bunny-storage] delete failed", objectPath, err);
  }
}

type SignOpts = { expiresInSec?: number };

/** Generate a signed Pull-Zone URL. Sync — just a sha256 hash. */
export function signBunnyFileUrl(objectPath: string, opts: SignOpts = {}): string {
  if (!isBunnyPullZoneConfigured()) {
    throw new Error("BUNNY_STORAGE_PULL_ZONE belum diset.");
  }
  const cleanPath = objectPath.startsWith("/") ? objectPath : `/${objectPath}`;
  const baseUrl = `https://${PULL_ZONE}${cleanPath}`;
  if (!TOKEN_KEY) {
    // Dev fallback: token auth disabled on the pull zone.
    return baseUrl;
  }
  const expires = Math.floor(Date.now() / 1000) + (opts.expiresInSec ?? DEFAULT_EXPIRES_SEC);
  const token = createHash("sha256")
    .update(`${TOKEN_KEY}${cleanPath}${expires}`)
    .digest("base64url");
  return `${baseUrl}?token=${token}&expires=${expires}`;
}

/**
 * Loader-facing resolver: if `stored` is an external http(s) URL, return it
 * as-is (per PRD §6.9.3 mentor can attach a URL instead of a file). Otherwise
 * sign it as a Bunny path. Returns `null` if the pull zone isn't configured
 * (so the UI can hide the download link gracefully).
 */
export function resolveTaskFileUrl(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (isExternalUrl(stored)) return stored;
  if (!isBunnyPullZoneConfigured()) return null;
  return signBunnyFileUrl(stored);
}

/**
 * Resolve a course image field (thumbnail / instructor photo / quiz image) for
 * rendering. Polymorphic like `resolveTaskFileUrl`: legacy seed rows store an
 * external http(s) URL (passthrough), admin-uploaded rows store a Bunny object
 * path (signed on read). Falls back to the raw value if the pull zone isn't
 * configured so dev still shows *something*. Empty input → "" (callers default).
 *
 * Longer TTL (24h) than task downloads: thumbnails render on public catalog
 * pages and a fresh signed URL is minted on every SSR render anyway.
 */
export function resolveCourseImageUrl(stored: string | null | undefined): string {
  if (!stored) return "";
  if (isExternalUrl(stored)) return stored;
  if (!isBunnyPullZoneConfigured()) return stored;
  return signBunnyFileUrl(stored, { expiresInSec: 60 * 60 * 24 });
}

/**
 * Resolve a badge icon (`Badge.logoUrl`) for rendering (PRD §6.11.8).
 * Polymorphic: a preset path under `/badges/...` is a public same-origin asset
 * (passthrough); an external http(s) URL is passthrough too; otherwise it's a
 * Bunny object path (signed on read, 24h TTL like course images). Returns
 * `null` for an empty/unconfigured value so the UI falls back to the text-based
 * trigger medallion.
 */
export function resolveBadgeIconUrl(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (stored.startsWith("/badges/")) return stored;
  if (isExternalUrl(stored)) return stored;
  if (!isBunnyPullZoneConfigured()) return null;
  return signBunnyFileUrl(stored, { expiresInSec: 60 * 60 * 24 });
}
