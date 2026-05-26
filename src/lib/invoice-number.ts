import { customAlphabet } from "nanoid";

/**
 * Invoice-number generator for orders (PRD §6.4). Format:
 * `INV-YYYYMMDD-XXXXXXXX` — the date is in WIB (UTC+7, hardcoded per CLAUDE.md)
 * and the suffix is 8 unambiguous random chars. Stays ≤50 chars so it can be
 * used directly as the Midtrans `order_id`, and within the checkout voucher
 * pattern's allowed character set.
 *
 * `0/O/1/l/I` are excluded to avoid ambiguity.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomPart = customAlphabet(ALPHABET, 8);

export function generateInvoiceNumber(now: Date = new Date()): string {
  // WIB calendar date, formatted as YYYYMMDD.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "2026-05-26"
  const ymd = parts.replace(/-/g, "");
  return `INV-${ymd}-${randomPart()}`;
}
