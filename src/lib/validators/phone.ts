import { isValidPhoneNumber, parsePhoneNumberWithError } from "libphonenumber-js";

/**
 * Phone helpers shared by the checkout form (client) and the order API (server).
 *
 * The buyer phone is OPTIONAL and stored as E.164 (e.g. "+6281234567890") — the
 * format `wa.me` / WhatsApp APIs expect, since this is groundwork for a planned
 * post-checkout WhatsApp notification. `libphonenumber-js` is isomorphic, so the
 * same validation runs on both sides.
 */

/** True for a blank value (optional) or a valid E.164 number. */
export function isValidOptionalPhone(value: string | null | undefined): boolean {
  if (!value || value.trim() === "") return true;
  return isValidPhoneNumber(value.trim());
}

/** Normalizes a parseable phone to E.164, or `null` when blank/invalid. */
export function toE164OrNull(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  try {
    const parsed = parsePhoneNumberWithError(value.trim());
    return parsed.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}
