import { customAlphabet } from "nanoid";

/**
 * Reward-voucher code generator (PRD §6.7.4).
 *
 * Codes are random, case-sensitive, and made of upper/lower letters + digits
 * so they can't be guessed. Format: `NLA-LV{level}-{8 random chars}` — e.g.
 * `NLA-LV5-K9eRT3pX`. The character set stays within the checkout validator's
 * allowed pattern (`[A-Za-z0-9_-]`, see `validators/checkout.ts`).
 *
 * `0`, `O`, `1`, `l`, `I` are intentionally excluded to avoid ambiguity when a
 * student types the code manually at checkout.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const randomPart = customAlphabet(ALPHABET, 8);

export function generateVoucherCode(level: number): string {
  return `NLA-LV${level}-${randomPart()}`;
}
