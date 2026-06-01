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

/** Repeatable lists (Visi / Misi / Tim) — soft caps to keep the blob bounded. */
export const PLATFORM_LIST_MAX = 20;
export const PLATFORM_STATEMENT_MAX = 240;
export const PLATFORM_TEAM_NAME_MAX = 80;
export const PLATFORM_TEAM_ROLE_MAX = 80;

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

/**
 * Visi / Misi items use an object wrapper (`{ value }`) rather than a bare
 * string so they bind cleanly + type-safely to react-hook-form's
 * `useFieldArray` (which expects object arrays). The loader tolerates legacy
 * bare-string entries on read.
 */
const statementItem = z.object({
  value: z
    .string()
    .trim()
    .min(1, "Tidak boleh kosong.")
    .max(PLATFORM_STATEMENT_MAX, `Maksimal ${PLATFORM_STATEMENT_MAX} karakter.`),
});

const teamMember = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(PLATFORM_TEAM_NAME_MAX, `Nama maksimal ${PLATFORM_TEAM_NAME_MAX} karakter.`),
  posisi: z
    .string()
    .trim()
    .min(1, "Posisi wajib diisi.")
    .max(PLATFORM_TEAM_ROLE_MAX, `Posisi maksimal ${PLATFORM_TEAM_ROLE_MAX} karakter.`),
});

export type PlatformStatement = z.infer<typeof statementItem>;
export type PlatformTeamMember = z.infer<typeof teamMember>;

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
  visi: z
    .array(statementItem)
    .max(PLATFORM_LIST_MAX, `Maksimal ${PLATFORM_LIST_MAX} visi.`),
  misi: z
    .array(statementItem)
    .max(PLATFORM_LIST_MAX, `Maksimal ${PLATFORM_LIST_MAX} misi.`),
  tim: z
    .array(teamMember)
    .max(PLATFORM_LIST_MAX, `Maksimal ${PLATFORM_LIST_MAX} anggota tim.`),
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
  visi: [],
  misi: [],
  tim: [],
};
