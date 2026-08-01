import { z } from "zod";

/**
 * Shared category form schema (client + server). Admin Kategori Course
 * (PRD §6.11.3.1).
 *
 * Kept "concrete" — no `z.coerce` / `.default()` — so the inferred input type
 * matches the output type and works cleanly with `zodResolver` (see the Kursus
 * gotcha in CLAUDE.md). The server normalises (trim, null) in
 * `admin-category-write.ts`.
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(100, "Nama kategori maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(300, "Deskripsi maksimal 300 karakter.")
    .optional(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
