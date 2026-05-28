/**
 * Preset profile avatars — the single source of truth for the avatar picker
 * (Settings) AND for server-side validation of `user.image`.
 *
 * Files live in `public/avatars/` and are served as static assets (no
 * Supabase/Bunny storage cost). To add or swap an avatar: drop the file into
 * `public/avatars/` and add/edit an entry below. The `src` MUST match an
 * existing file. Keep this module free of `server-only` so it can be imported
 * from both the client picker and the shared Zod validator.
 *
 * Asset spec (see docs/superpowers plan): square 1:1, rendered round, largest
 * display 96px. Ship a single 256×256 file per avatar — WebP/PNG ≤ ~25 KB, or
 * a tiny SVG (the bundled placeholders below). No @2x/@3x needed.
 */
export type AvatarOption = {
  /** Stable identifier (kebab-case). Not persisted — `src` is what we store. */
  id: string;
  /** Public path persisted to `user.image` and used directly as <img src>. */
  src: string;
  /** Indonesian label shown under the tile / as alt text. */
  label: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "aurora", src: "/avatars/aurora.svg", label: "Aurora" },
  { id: "sunset", src: "/avatars/sunset.svg", label: "Senja" },
  { id: "ocean", src: "/avatars/ocean.svg", label: "Samudra" },
  { id: "forest", src: "/avatars/forest.svg", label: "Rimba" },
  { id: "ember", src: "/avatars/ember.svg", label: "Bara" },
  { id: "violet", src: "/avatars/violet.svg", label: "Lavender" },
  { id: "slate", src: "/avatars/slate.svg", label: "Batu" },
  { id: "mint", src: "/avatars/mint.svg", label: "Mint" },
];

/** Allowlist of valid avatar paths — used to validate `user.image`. */
export const AVATAR_PATHS: ReadonlySet<string> = new Set(
  AVATAR_OPTIONS.map((o) => o.src),
);

/** True when `path` is one of the registered preset avatars. */
export function isValidAvatarPath(path: string): boolean {
  return AVATAR_PATHS.has(path);
}
