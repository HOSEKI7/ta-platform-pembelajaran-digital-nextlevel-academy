/**
 * Convert rich-text HTML (produced by the Tiptap editors) into a plain-text
 * string — for `<meta>` descriptions, social previews, and short summaries where
 * markup must never leak through as literal tags.
 *
 * Server-safe: pure string transforms, no DOM. Block-level tags collapse to a
 * space so words don't run together; the common HTML entities are decoded.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|ul|ol|tr)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}
