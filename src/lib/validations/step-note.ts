import { z } from "zod";

/** Max length for a single step's personal note (Catatan tab). */
export const STEP_NOTE_MAX = 5000;

/**
 * Personal per-step note payload (Course Player "Catatan" tab). `content` is
 * autosaved; an empty string is valid and means "delete this note".
 */
export const saveStepNoteSchema = z.object({
  content: z
    .string()
    .max(STEP_NOTE_MAX, `Catatan maksimal ${STEP_NOTE_MAX} karakter.`),
});

export type SaveStepNoteInput = z.infer<typeof saveStepNoteSchema>;
