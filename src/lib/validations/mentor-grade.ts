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
