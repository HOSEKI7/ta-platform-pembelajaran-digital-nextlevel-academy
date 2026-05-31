import "server-only";

import { readdirSync } from "node:fs";
import path from "node:path";

/**
 * Preset badge icons — derived **automatically** from the files in
 * `public/badges/` so adding a new icon needs zero code changes. Mirrors
 * `src/lib/avatars.ts`: the admin badge-icon picker offers these presets plus an
 * upload option, and a text-based per-trigger medallion is used as the fallback.
 *
 * Files are listed sorted by name; the base filename (sans extension) becomes
 * the human label after a light prettify. `server-only` because it touches the
 * filesystem — client components may import the `BadgeIconOption` **type** only
 * and receive the resolved list as a prop.
 *
 * Icon assets: square 1:1, rendered rounded. SVG (text, version-controlled) is
 * the cheapest option and is fully supported here.
 */
export type BadgeIconOption = {
  /** Stable id, e.g. `medal-gold`. */
  id: string;
  /** Public path persisted to `Badge.logoUrl` and used directly as <img src>. */
  src: string;
  /** Indonesian label / alt text. */
  label: string;
};

const BADGE_DIR = path.join(process.cwd(), "public", "badges");
const IMAGE_RE = /\.(webp|png|jpe?g|svg)$/i;

let cache: BadgeIconOption[] | null = null;

function prettify(base: string): string {
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function build(): BadgeIconOption[] {
  let files: string[];
  try {
    files = readdirSync(BADGE_DIR);
  } catch {
    return [];
  }

  return files
    .filter((f) => IMAGE_RE.test(f))
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((file) => {
      const base = file.replace(IMAGE_RE, "");
      return { id: base, src: `/badges/${file}`, label: prettify(base) };
    });
}

/** Ordered preset badge icons. Cached in production; always fresh in dev. */
export function loadBadgeIconOptions(): BadgeIconOption[] {
  if (process.env.NODE_ENV === "production") {
    if (!cache) cache = build();
    return cache;
  }
  return build();
}

/** Allowlist of valid preset icon paths — used to validate `Badge.logoUrl`. */
export function loadBadgeIconPaths(): Set<string> {
  return new Set(loadBadgeIconOptions().map((o) => o.src));
}

/** True when `value` is one of the registered preset badge icons. */
export function isValidBadgeIconPath(value: string): boolean {
  return loadBadgeIconPaths().has(value);
}
