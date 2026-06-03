import { z } from "zod";

/**
 * Final-grade payload shared by the client form and the API route. Grade is an
 * integer 0–100 (matches `FinalGrade.grade Int?`); the note is optional.
 */
export const upsertGradeSchema = z.object({
  grade: z
    .number({ message: "Nilai wajib diisi." })
    .int("Nilai harus bilangan bulat.")
    .min(0, "Nilai minimal 0.")
    .max(100, "Nilai maksimal 100."),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").nullish(),
});

export type UpsertGradeInput = z.infer<typeof upsertGradeSchema>;

/**
 * Sanitize a raw grade-input string for an as-you-type number field: strips
 * every non-digit (so letters/symbols never land), drops leading zeros, and
 * clamps anything above 100 down to "100". Returns "" for an empty field so the
 * user can clear it. Used by the mentor + admin final-grade dialogs.
 */
export function sanitizeGradeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  const n = Number(digits);
  return n > 100 ? "100" : String(n);
}
