import { z } from "zod";

/**
 * Shared Zod schema for the admin global certificate-expiry setting
 * (PRD §6.11.7). Used server-side (settings route) and by the client form.
 *
 * `years = null` means "tanpa kedaluwarsa" (no expiry). Otherwise a positive
 * integer count of years applied to NEW certificates only (non-retroactive).
 * The client converts its empty `datetime`-style text field to `null` before
 * sending, so the schema stays "concrete" (number | null, no coercion).
 */

export const CERT_EXPIRY_MAX_YEARS = 100;

export const certExpirySettingSchema = z.object({
  years: z
    .number()
    .int("Masa berlaku harus bilangan bulat tahun.")
    .min(1, "Masa berlaku minimal 1 tahun.")
    .max(CERT_EXPIRY_MAX_YEARS, `Masa berlaku maksimal ${CERT_EXPIRY_MAX_YEARS} tahun.`)
    .nullable(),
});

export type CertExpirySettingInput = z.infer<typeof certExpirySettingSchema>;
