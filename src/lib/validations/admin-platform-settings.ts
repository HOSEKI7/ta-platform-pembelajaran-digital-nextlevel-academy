import { z } from "zod";

/**
 * Shared Zod schema for the admin "Informasi Platform" tab (PRD §6.11.11).
 *
 * Persisted as a single JSON blob under the `PLATFORM_INFO` key in
 * `platform_setting` (one upsert / one read — these fields always move
 * together and nothing queries them individually yet). Used by both the
 * client form (zodResolver) and the PUT route, so it stays "concrete": every
 * field is a plain string with explicit max-length, no coercion / no
 * `.default()`, so the parsed output matches the form's input shape.
 *
 * Only `namaPlatform` is required (it's the public display name). The rest are
 * optional — an empty string is a valid "not set yet" value.
 */

export const PLATFORM_NAME_MAX = 80;
export const PLATFORM_TAGLINE_MAX = 120;
export const PLATFORM_DESCRIPTION_MAX = 500;
export const PLATFORM_EMAIL_MAX = 120;
export const PLATFORM_WHATSAPP_MAX = 24;
export const PLATFORM_ADDRESS_MAX = 200;
export const PLATFORM_CITY_MAX = 80;
export const PLATFORM_COUNTRY_MAX = 80;
export const PLATFORM_HOURS_MAX = 120;

/** Optional free-text field: trimmed, capped, empty allowed. */
function optionalText(max: number, label: string) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indonesian-friendly phone shape: digits, spaces, +, -, parentheses. Empty allowed.
const WHATSAPP_RE = /^[0-9+\-\s()]+$/;

export const platformInfoSchema = z.object({
  namaPlatform: z
    .string()
    .trim()
    .min(2, "Nama platform minimal 2 karakter.")
    .max(PLATFORM_NAME_MAX, `Nama platform maksimal ${PLATFORM_NAME_MAX} karakter.`),
  tagline: optionalText(PLATFORM_TAGLINE_MAX, "Tagline"),
  deskripsi: optionalText(PLATFORM_DESCRIPTION_MAX, "Deskripsi"),
  emailKontak: optionalText(PLATFORM_EMAIL_MAX, "Email kontak").refine(
    (v) => v.length === 0 || EMAIL_RE.test(v),
    "Email kontak tidak valid.",
  ),
  nomorWhatsapp: optionalText(PLATFORM_WHATSAPP_MAX, "Nomor WhatsApp").refine(
    (v) => v.length === 0 || WHATSAPP_RE.test(v),
    "Nomor WhatsApp hanya boleh berisi angka dan simbol + - ( ).",
  ),
  alamat: optionalText(PLATFORM_ADDRESS_MAX, "Alamat"),
  kota: optionalText(PLATFORM_CITY_MAX, "Kota"),
  negara: optionalText(PLATFORM_COUNTRY_MAX, "Negara"),
  jamOperasional: optionalText(PLATFORM_HOURS_MAX, "Jam operasional"),
});

export type PlatformInfo = z.infer<typeof platformInfoSchema>;

/** Empty defaults — the "never configured" baseline used by the loader/form. */
export const EMPTY_PLATFORM_INFO: PlatformInfo = {
  namaPlatform: "",
  tagline: "",
  deskripsi: "",
  emailKontak: "",
  nomorWhatsapp: "",
  alamat: "",
  kota: "",
  negara: "",
  jamOperasional: "",
};
