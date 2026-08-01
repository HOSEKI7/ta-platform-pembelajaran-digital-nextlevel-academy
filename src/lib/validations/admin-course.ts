import { z } from "zod";

/**
 * Shared Zod schemas for the admin "Tambah/Edit Kursus" flow (PRD §6.11.3).
 * Used client-side (react-hook-form resolver) and server-side (route handlers).
 * File uploads (thumbnail, instructor photo, quiz images) are validated in the
 * route from the multipart body, not here.
 */

export const COURSE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type CourseStatusValue = (typeof COURSE_STATUSES)[number];

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugField = () =>
  z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(80)
    .regex(SLUG_REGEX, "Slug hanya huruf kecil, angka, dan tanda hubung.");

export const benefitSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Benefit tidak boleh kosong.")
    .max(100, "Benefit maksimal 100 karakter."),
});

export const faqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Pertanyaan tidak boleh kosong.")
    .max(150, "Pertanyaan maksimal 150 karakter."),
  answer: z
    .string()
    .trim()
    .min(1, "Jawaban tidak boleh kosong.")
    .max(150, "Jawaban maksimal 150 karakter."),
});

/**
 * General Information + Pengaturan Kursus fields. Kept "concrete" (no `z.coerce`
 * / `.default()`) so the schema's input and output types match — that lets the
 * react-hook-form `zodResolver` type cleanly against the form values. The client
 * form supplies real numbers/booleans; the server parser converts the multipart
 * strings before validating. Save-as-DRAFT is lenient
 * (thumbnail/instructor photo optional); the stricter Publish gate (PRD §6.11.3
 * "Validasi Sebelum Publish") runs server-side on status change.
 */
export const courseGeneralSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Judul minimal 3 karakter.")
      .max(100, "Judul course maksimal 100 karakter."),
    shortDescription: z.string().trim().max(280, "Deskripsi singkat maksimal 280 karakter."),
    description: z
      .string()
      .trim()
      .min(1, "Deskripsi wajib diisi.")
      .max(1500, "Deskripsi lengkap maksimal 1500 karakter."),
    categoryId: z.string().trim().min(1, "Kategori wajib dipilih."),
    price: z
      .number()
      .int("Harga harus bilangan bulat.")
      .min(0, "Harga tidak boleh negatif.")
      .max(999999999, "Harga maksimal 9 digit (Rp999.999.999)."),
    fakePrice: z
      .number()
      .int("Harga coret harus bilangan bulat.")
      .min(0, "Harga coret tidak boleh negatif.")
      .max(999999999, "Harga coret maksimal 9 digit (Rp999.999.999).")
      .nullable(),
    instructor: z
      .string()
      .trim()
      .min(2, "Nama instruktur wajib diisi.")
      .max(100, "Nama instruktur maksimal 100 karakter."),
    instructorBio: z
      .string()
      .trim()
      .min(1, "Bio instruktur wajib diisi.")
      .max(300, "Bio instruktur maksimal 300 karakter."),
    isFeatured: z.boolean(),
    status: z.enum(COURSE_STATUSES),
    benefits: z.array(benefitSchema).max(20),
    faqs: z.array(faqSchema).max(20),
  })
  .refine(
    (d) => d.fakePrice == null || d.fakePrice === 0 || d.fakePrice > d.price,
    { path: ["fakePrice"], message: "Harga coret harus lebih tinggi dari harga." },
  );

/** Create schema — no slug (auto-generated from title on the server). */
export const courseCreateSchema = courseGeneralSchema;
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

/** Edit schema — slug is required (admin sets it manually). */
export const courseEditSchema = courseGeneralSchema.extend({
  slug: slugField(),
});
export type CourseGeneralInput = z.infer<typeof courseEditSchema>;

// ---- Curriculum --------------------------------------------------------------

export const sprintSchema = z.object({
  title: z.string().trim().min(2, "Nama sprint minimal 2 karakter.").max(120),
});
export type SprintInput = z.infer<typeof sprintSchema>;

export const videoStepSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Judul video minimal 2 karakter.")
    .max(100, "Judul step maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(3000, "Deskripsi materi maksimal 3000 karakter.")
    .default(""),
  bunnyVideoId: z.string().trim().min(1, "Video belum terunggah."),
});
export type VideoStepInput = z.infer<typeof videoStepSchema>;

export const quizQuestionSchema = z
  .object({
    question: z
      .string()
      .trim()
      .max(2000, "Soal quiz maksimal 2000 karakter.")
      .optional()
      .default(""),
    questionImageUrl: z.string().trim().optional().nullable(),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Opsi tidak boleh kosong.")
          .max(500, "Opsi jawaban maksimal 500 karakter.")
      )
      .min(2, "Minimal 2 opsi jawaban."),
    answer: z.number().int().min(0, "Pilih satu jawaban benar."),
  })
  .refine((q) => q.question.trim().length > 0 || (q.questionImageUrl?.length ?? 0) > 0, {
    path: ["question"],
    message: "Pertanyaan harus berupa teks atau gambar.",
  })
  .refine((q) => q.answer < q.options.length, {
    path: ["answer"],
    message: "Jawaban benar tidak valid.",
  });
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

export const quizStepSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Judul quiz minimal 2 karakter.")
    .max(100, "Judul step maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(3000, "Deskripsi materi maksimal 3000 karakter.")
    .default(""),
  passingScore: z.coerce.number().int().min(0).max(100).default(80),
  questions: z.array(quizQuestionSchema).min(1, "Quiz minimal punya 1 soal."),
});
export type QuizStepInput = z.infer<typeof quizStepSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(COURSE_STATUSES),
});
