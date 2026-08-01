import { z } from "zod";

/**
 * Shared badge form schema (client + server). PRD §6.11.8.
 *
 * Kept "concrete" — no `z.coerce` / `.default()` — so the inferred input type
 * matches the output type and works cleanly with `zodResolver` (see the Kursus
 * gotcha in CLAUDE.md). The server normalises (trim, null) in
 * `admin-badge-write.ts`.
 *
 * Trigger semantics (mirrors `Badge.threshold` / `courseId` in the schema):
 *   - LEVEL_REACHED      → `threshold` = level number (≥ 1), `courseId` unused
 *   - COURSES_COMPLETED  → `threshold` = course count (≥ 1), `courseId` unused
 *   - COURSE_SPECIFIC    → `courseId` required, `threshold` ignored (stored 0)
 *
 * `expMinimum` is informational metadata (does NOT drive awarding).
 *
 * `trigger` is a plain string enum matching the Prisma `BadgeTrigger` values —
 * kept Prisma-free so this shared schema can be imported into client bundles
 * (same approach as `admin-voucher.ts`).
 */
export const BADGE_TRIGGERS = [
  "LEVEL_REACHED",
  "COURSES_COMPLETED",
  "COURSE_SPECIFIC",
] as const;

export const badgeFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama badge minimal 2 karakter.")
      .max(100, "Nama badge maksimal 100 karakter."),
    description: z
      .string()
      .trim()
      .max(300, "Deskripsi cara mendapat maksimal 300 karakter.")
      .optional(),
    trigger: z.enum(BADGE_TRIGGERS),
    threshold: z.number().int().min(0).max(9999),
    courseId: z.string().trim().min(1).nullable().optional(),
    expMinimum: z
      .number()
      .int("EXP harus bilangan bulat.")
      .min(0, "EXP minimal 0.")
      .max(100000, "EXP maksimal 100.000."),
    logoUrl: z.string().trim().min(1).max(500).nullable().optional(),
  })
  .refine((v) => v.trigger === "COURSE_SPECIFIC" || v.threshold >= 1, {
    message: "Threshold harus minimal 1.",
    path: ["threshold"],
  })
  .refine(
    (v) =>
      v.trigger !== "COURSE_SPECIFIC" ||
      (v.courseId != null && v.courseId.length > 0),
    { message: "Pilih kursus untuk badge ini.", path: ["courseId"] },
  );

export type BadgeFormInput = z.infer<typeof badgeFormSchema>;
