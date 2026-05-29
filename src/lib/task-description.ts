import "server-only";

import {
  isBunnyPullZoneConfigured,
  signBunnyFileUrl,
} from "@/lib/bunny-storage";

/**
 * Server-side handling for the rich-text task description (HTML from Tiptap).
 *
 * Storage model (user decision): pasted images are uploaded to Bunny and the
 * HTML stores the **object path** in both `src` and `data-bunny-path`; the URL
 * is **signed again on every read** (mirrors `resolveTaskFileUrl`) so images
 * never expire.
 *
 * Security (user decision: no extra sanitizer dep): the author is a trusted
 * MENTOR and Tiptap already normalizes pasted content to its schema (no
 * scripts / event handlers). We add a defensive pass anyway —
 * `normalizeTaskDescriptionImages` rewrites every `<img>` to ONLY a validated
 * Bunny `task-images/...` path (dropping any other src, tokens, or attributes),
 * strips inline `on*` handlers, and neutralizes `javascript:` hrefs.
 */

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const DATA_PATH_RE = /data-bunny-path\s*=\s*"([^"]*)"/i;
const ON_HANDLER_RE = /\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_HREF_RE = /href\s*=\s*("|')\s*javascript:[^"']*\1/gi;

/** A valid pasted-image path: under `task-images/`, no traversal. */
function isValidImagePath(path: string): boolean {
  return (
    /^task-images\/[A-Za-z0-9._\-/]+$/.test(path) && !path.includes("..")
  );
}

type NormalizeResult = { html: string; imageCount: number };

/**
 * Rewrite description HTML for storage. Every `<img>` becomes a minimal
 * `<img src="<path>" data-bunny-path="<path>">` pointing at a validated Bunny
 * object path; images without a valid path are removed. Returns the cleaned
 * HTML plus the count of kept images (so the route can enforce the 1-image cap).
 */
export function normalizeTaskDescriptionImages(html: string): NormalizeResult {
  let imageCount = 0;

  let cleaned = html.replace(IMG_TAG_RE, (tag) => {
    const match = tag.match(DATA_PATH_RE);
    const path = match?.[1];
    if (!path || !isValidImagePath(path)) return "";
    imageCount += 1;
    return `<img src="${path}" data-bunny-path="${path}">`;
  });

  // Defensive: strip inline event handlers and javascript: hrefs anywhere.
  cleaned = cleaned.replace(ON_HANDLER_RE, "").replace(JS_HREF_RE, "");

  return { html: cleaned, imageCount };
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
