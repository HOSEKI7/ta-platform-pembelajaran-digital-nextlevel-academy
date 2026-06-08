import "server-only";

import {
  TASK_IMAGE_ALLOWED_TYPES,
  TASK_IMAGE_MAX_BYTES,
  isBunnyPullZoneConfigured,
  signBunnyFileUrl,
  uploadTaskImage,
} from "@/lib/bunny-storage";

/**
 * Server-side handling for the rich-text task description (HTML from Tiptap).
 *
 * Storage model (user decision): a description image is uploaded to Bunny only
 * when the task is saved (`prepareTaskDescription`, deferred-upload). The stored
 * HTML keeps the **object path** in both `src` and `data-bunny-path`; the URL is
 * **signed again on every read** (mirrors `resolveTaskFileUrl`) so it never
 * expires. A freshly attached image arrives as a separate `descriptionImage`
 * File and is marked in the HTML with `data-pending-image="1"`.
 *
 * Security (user decision: no extra sanitizer dep): the author is a trusted
 * MENTOR/ADMIN and Tiptap already normalizes pasted content to its schema (no
 * scripts / event handlers). We add a defensive pass anyway —
 * `buildStoredDescription` rewrites the single `<img>` to ONLY a validated Bunny
 * `task-images/...` path (dropping any other src, tokens, or attributes), strips
 * inline `on*` handlers, and neutralizes `javascript:` hrefs.
 */

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const DATA_PATH_RE = /data-bunny-path\s*=\s*"([^"]*)"/i;
/** Marks an `<img>` whose bytes are still in the browser (deferred upload). */
const PENDING_ATTR_RE = /data-pending-image\s*=\s*"?1"?/i;
const ON_HANDLER_RE = /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_HREF_RE = /href\s*=\s*("|')\s*javascript:[^"']*\1/gi;

/** A valid pasted-image path: under `task-images/`, no traversal. */
function isValidImagePath(path: string): boolean {
  return (
    /^task-images\/[A-Za-z0-9._\-/]+$/.test(path) && !path.includes("..")
  );
}

export type DescriptionImageAnalysis =
  | { ok: true; existingPath: string | null; pendingCount: number }
  | { ok: false; error: string };

/**
 * Inspect editor HTML before saving (deferred-upload model). Distinguishes two
 * kinds of `<img>`:
 *  - **existing**: carries a valid `data-bunny-path` (an image already stored on
 *    a previous save, kept as-is) → `existingPath`.
 *  - **pending**: carries `data-pending-image="1"` (bytes still client-side; the
 *    route uploads the accompanying `descriptionImage` File) → counted.
 * Enforces the 1-image cap across both kinds. Other `<img>` (no valid path, not
 * pending) are ignored here and dropped by `buildStoredDescription`.
 */
export function analyzeTaskDescriptionImages(html: string): DescriptionImageAnalysis {
  let existingPath: string | null = null;
  let existingCount = 0;
  let pendingCount = 0;

  for (const tag of html.match(IMG_TAG_RE) ?? []) {
    if (PENDING_ATTR_RE.test(tag)) {
      pendingCount += 1;
      continue;
    }
    const path = tag.match(DATA_PATH_RE)?.[1];
    if (path && isValidImagePath(path)) {
      existingPath = path;
      existingCount += 1;
    }
  }

  if (existingCount + pendingCount > 1) {
    return { ok: false, error: "Maksimal 1 gambar per deskripsi." };
  }
  return { ok: true, existingPath, pendingCount };
}

/**
 * Rewrite description HTML for storage. The single image (if any) becomes a
 * minimal `<img src="<finalPath>" data-bunny-path="<finalPath>">`; every other
 * `<img>` (pending placeholder, blob preview, stray) is dropped. When
 * `finalPath` is null the description has no image. Also strips inline event
 * handlers and `javascript:` hrefs defensively.
 */
export function buildStoredDescription(
  html: string,
  finalPath: string | null,
): string {
  let used = false;
  let cleaned = html.replace(IMG_TAG_RE, () => {
    if (!finalPath || used) return "";
    used = true;
    return `<img src="${finalPath}" data-bunny-path="${finalPath}">`;
  });
  cleaned = cleaned.replace(ON_HANDLER_RE, "").replace(JS_HREF_RE, "");
  return cleaned;
}

export type PrepareDescriptionResult =
  | { ok: true; html: string; uploadedPath: string | null; finalPath: string | null }
  | { ok: false; error: string; status: number };

/**
 * Resolve a task description for storage under the deferred-upload model. Shared
 * by the create/edit routes (mentor + admin):
 *  - validates the 1-image cap,
 *  - if a pending image is present, validates + uploads the accompanying File to
 *    Bunny (returns `uploadedPath` so the caller can roll it back on DB failure),
 *  - returns the normalized HTML plus `finalPath` (the image path now stored, or
 *    null) so the caller can clean up any replaced/removed old image.
 */
export async function prepareTaskDescription(opts: {
  html: string;
  pendingImage: FormDataEntryValue | null;
  uploaderId: string;
}): Promise<PrepareDescriptionResult> {
  const analysis = analyzeTaskDescriptionImages(opts.html);
  if (!analysis.ok) return { ok: false, error: analysis.error, status: 400 };

  let finalPath: string | null = analysis.existingPath;
  let uploadedPath: string | null = null;

  if (analysis.pendingCount === 1) {
    const file = opts.pendingImage;
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Gambar deskripsi tidak ditemukan.", status: 400 };
    }
    if (!(TASK_IMAGE_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return {
        ok: false,
        error: "Format gambar tidak didukung. Gunakan PNG, JPG, WEBP, atau GIF.",
        status: 400,
      };
    }
    if (file.size > TASK_IMAGE_MAX_BYTES) {
      return { ok: false, error: "Ukuran gambar melebihi batas 5 MB.", status: 413 };
    }
    try {
      const uploaded = await uploadTaskImage({ mentorId: opts.uploaderId, file });
      uploadedPath = uploaded.objectPath;
      finalPath = uploaded.objectPath;
    } catch (err) {
      console.error("[task-description] image upload failed", err);
      const msg =
        err instanceof Error && err.message.includes("belum dikonfigurasi")
          ? "Penyimpanan file belum dikonfigurasi di server."
          : "Gagal mengunggah gambar ke penyimpanan.";
      return { ok: false, error: msg, status: 502 };
    }
  }

  return {
    ok: true,
    html: buildStoredDescription(opts.html, finalPath),
    uploadedPath,
    finalPath,
  };
}

/**
 * Collect the Bunny object paths of every inline image in stored description
 * HTML. Used on task delete to best-effort clean up the image blobs.
 */
export function extractTaskImagePaths(html: string): string[] {
  if (!html) return [];
  const paths: string[] = [];
  for (const tag of html.match(IMG_TAG_RE) ?? []) {
    const path = tag.match(DATA_PATH_RE)?.[1];
    if (path && isValidImagePath(path)) paths.push(path);
  }
  return paths;
}

/**
 * Rewrite stored description HTML for reading: sign every Bunny image path into
 * a fresh, time-limited URL. No-op (leaves the path) when the pull zone isn't
 * configured, so dev without Bunny degrades to a broken-image rather than a 500.
 */
export function signTaskDescriptionImages(html: string): string {
  if (!html || !isBunnyPullZoneConfigured()) return html;

  return html.replace(IMG_TAG_RE, (tag) => {
    const match = tag.match(DATA_PATH_RE);
    const path = match?.[1];
    if (!path || !isValidImagePath(path)) return "";
    const signed = signBunnyFileUrl(path);
    return `<img src="${signed}" data-bunny-path="${path}">`;
  });
}
