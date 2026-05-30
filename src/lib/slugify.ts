/**
 * Turn an arbitrary title into a URL-safe slug. Shared by the client form
 * (live preview as the admin types) and the server (slug fallback + validation).
 * Pure + dependency-free so it can run in both runtimes.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}
