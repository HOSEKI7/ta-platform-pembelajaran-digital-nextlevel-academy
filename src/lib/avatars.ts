import "server-only";

import { readdirSync } from "node:fs";
import path from "node:path";

/**
 * Preset profile avatars — derived **automatically** from the files in
 * `public/avatars/` so adding a new image needs zero code changes.
 *
 * Naming convention drives ordering: `<Gender>_<N>.<ext>` where Gender is
 * `Male` or `Female` (case-insensitive) and N is a positive integer. Options
 * are interleaved by index with Male before Female, i.e.
 *   Male_1, Female_1, Male_2, Female_2, …
 * Drop in `Male_5.webp` + `Female_5.webp` later and they slot into place.
 * Files that don't match the convention are appended (sorted by name) so
 * nothing silently disappears.
 *
 * This module is `server-only` (it touches the filesystem). Client components
 * may only import the `AvatarOption` **type** (erased at build) and receive the
 * resolved list as a prop. Avatar assets: square 1:1, rendered round; a single
 * 256×256 WebP ≤ ~25 KB per file is ideal.
 */
export type AvatarOption = {
  /** Stable id, e.g. `male-1`. */
  id: string;
  /** Public path persisted to `user.image` and used directly as <img src>. */
  src: string;
  /** Indonesian label / alt text, e.g. "Pria 1". */
  label: string;
};

const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");
const IMAGE_RE = /\.(webp|png|jpe?g|svg)$/i;
const GENDERED_RE = /^(male|female)_(\d+)\.(?:webp|png|jpe?g|svg)$/i;

const GENDER_LABEL: Record<string, string> = { male: "Pria", female: "Wanita" };
const GENDER_RANK: Record<string, number> = { male: 0, female: 1 };

let cache: AvatarOption[] | null = null;

function build(): AvatarOption[] {
  let files: string[];
  try {
    files = readdirSync(AVATAR_DIR);
  } catch {
    return [];
  }

  const gendered: { file: string; gender: string; index: number }[] = [];
  const others: string[] = [];

  for (const file of files) {
    if (!IMAGE_RE.test(file)) continue;
    const m = GENDERED_RE.exec(file);
    if (m) {
      gendered.push({ file, gender: m[1].toLowerCase(), index: Number(m[2]) });
    } else {
      others.push(file);
    }
  }

  // index asc, then Male before Female → Male_1, Female_1, Male_2, Female_2 …
  gendered.sort(
    (a, b) => a.index - b.index || GENDER_RANK[a.gender] - GENDER_RANK[b.gender],
  );
  others.sort((a, b) => a.localeCompare(b, "en"));

  const options: AvatarOption[] = gendered.map((g) => ({
    id: `${g.gender}-${g.index}`,
    src: `/avatars/${g.file}`,
    label: `${GENDER_LABEL[g.gender]} ${g.index}`,
  }));

  for (const file of others) {
    const base = file.replace(IMAGE_RE, "");
    options.push({ id: base, src: `/avatars/${file}`, label: base });
  }

  return options;
}

/** Ordered preset avatars. Cached in production; always fresh in dev. */
export function loadAvatarOptions(): AvatarOption[] {
  if (process.env.NODE_ENV === "production") {
    if (!cache) cache = build();
    return cache;
  }
  return build();
}

/** Allowlist of valid avatar paths — used to validate `user.image`. */
export function loadAvatarPaths(): Set<string> {
  return new Set(loadAvatarOptions().map((o) => o.src));
}

/** True when `value` is one of the registered preset avatars. */
export function isValidAvatarPath(value: string): boolean {
  return loadAvatarPaths().has(value);
}
