import { z } from "zod";

/**
 * Shared form schemas (client + server) for the admin "Konfigurasi Jam Kerja
 * dan Libur" surface — the Tanggal Libur (Holiday) tab (PRD §6.9 / §5.3).
 *
 * Kept "concrete" (no `z.coerce` / `.default()`) so the inferred input type
 * matches the output type and works cleanly with `zodResolver` (see the Kursus
 * gotcha in CLAUDE.md). The day count is parsed with `valueAsNumber` in the
 * form. The server (admin-internship-holiday-write.ts) is the single source of
 * truth for the state machine (UPCOMING / ACTIVE / PAST) and recomputes the
 * end date / duration so the three redundant columns stay consistent.
 */

/** Native `<input type="date">` value, e.g. "2026-04-14" (a WIB calendar date). */
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");

const description = z
  .string()
  .trim()
  .min(2, "Keterangan libur minimal 2 karakter.")
  .max(100, "Keterangan libur maksimal 100 karakter.");

const days = z
  .number({ message: "Jumlah hari libur wajib diisi." })
  .int("Jumlah hari harus berupa angka bulat.")
  .min(1, "Jumlah hari libur minimal 1.")
  .max(365, "Jumlah hari libur maksimal 365 hari (1 tahun).");

const reason = z
  .string()
  .trim()
  .max(200, "Alasan maksimal 200 karakter.")
  .optional();

// ---- Create / UPCOMING edit (description + days + start date) ---------------

/** Create a holiday, and the same fields a fully-editable UPCOMING holiday uses. */
export const holidayCreateSchema = z.object({
  description,
  days,
  startDate: dateOnly,
});

export type HolidayCreateInput = z.infer<typeof holidayCreateSchema>;

/** Client form schema for the UPCOMING edit dialog (mode added by the hook). */
export const holidayEditFormSchema = holidayCreateSchema.extend({ reason });

export type HolidayEditFormInput = z.infer<typeof holidayEditFormSchema>;

// ---- ACTIVE "Akhiri Lebih Awal" (description + new end date) ----------------

/** Client form schema for the ACTIVE end-early dialog (mode added by the hook). */
export const holidayEndEarlyFormSchema = z.object({
  description,
  newEndDate: dateOnly,
  reason,
});

export type HolidayEndEarlyFormInput = z.infer<typeof holidayEndEarlyFormSchema>;

// ---- Server PATCH body (discriminated union — state-gated server-side) -------

export const holidayUpdateSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("edit"),
    description,
    days,
    startDate: dateOnly,
    reason,
  }),
  z.object({
    mode: z.literal("endEarly"),
    description,
    newEndDate: dateOnly,
    reason,
  }),
]);

export type HolidayUpdateInput = z.infer<typeof holidayUpdateSchema>;
