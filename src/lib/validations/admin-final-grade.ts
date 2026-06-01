import { z } from "zod";

/**
 * Admin final-grade override payload, shared by the client form and the API
 * route (PRD §6.11.9 / §6.9.4). The grade is an integer 0–100 (matches
 * `FinalGrade.grade Int?`); the note is the optional grade comment (visible to
 * the student), while `reason` is the MANDATORY administrative justification —
 * recorded only in the AuditLog, never on the grade row.
 */
export const adminFinalGradeSchema = z.object({
  grade: z
    .number({ message: "Nilai wajib diisi." })
    .int("Nilai harus bilangan bulat.")
    .min(0, "Nilai minimal 0.")
    .max(100, "Nilai maksimal 100."),
  note: z.string().trim().max(500, "Catatan maksimal 500 karakter.").nullish(),
  reason: z
    .string({ message: "Alasan wajib diisi." })
    .trim()
    .min(1, "Alasan wajib diisi.")
    .max(500, "Alasan maksimal 500 karakter."),
});

export type AdminFinalGradeInput = z.infer<typeof adminFinalGradeSchema>;
