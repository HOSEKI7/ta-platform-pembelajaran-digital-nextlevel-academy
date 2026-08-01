import { z } from "zod";

/**
 * Shared form schemas (client + server) for the admin "Konfigurasi Magang"
 * surface at `/admin/internship/config` (PRD §6.9 / §5.3) — the Batch / Bidang /
 * Kelas structure that every internship feature joins on via `classId`.
 *
 * Kept "concrete" (no `z.coerce` / `.default()`) so the inferred input type
 * matches the output type and works cleanly with `zodResolver` (see the Kursus
 * gotcha in CLAUDE.md). The server normalises (trim) and converts dates to
 * UTC-midnight in `admin-internship-config-write.ts`.
 */

const cuid = z.string().min(1, "ID tidak valid.");

/** Native `<input type="date">` value, e.g. "2026-04-14". */
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");

export const kodeBatchSchema = z
  .string()
  .regex(/^\d{3}$/, "Kode batch harus 3 digit angka (contoh: 001)");

export const kodeBidangSchema = z
  .string()
  .regex(/^\d{3}$/, "Kode bidang harus 3 digit angka (contoh: 111)");

// ---- Batch -----------------------------------------------------------------

export const batchFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama batch minimal 2 karakter.")
      .max(100, "Nama batch maksimal 100 karakter."),
    kode_batch: kodeBatchSchema,
    description: z
      .string()
      .trim()
      .min(2, "Keterangan minimal 2 karakter.")
      .max(300, "Keterangan maksimal 300 karakter."),
    startDate: dateOnly,
    endDate: dateOnly,
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
    path: ["endDate"],
  });

export type BatchFormInput = z.infer<typeof batchFormSchema>;

// ---- Bidang (Field) --------------------------------------------------------

export const fieldCreateSchema = z.object({
  batchId: cuid,
  kode_bidang: kodeBidangSchema,
  name: z
    .string()
    .trim()
    .min(2, "Nama bidang minimal 2 karakter.")
    .max(100, "Nama bidang maksimal 100 karakter."),
});

export type FieldCreateInput = z.infer<typeof fieldCreateSchema>;

/** Edit only renames the field; the batch is locked. */
export const fieldUpdateSchema = z.object({
  kode_bidang: kodeBidangSchema,
  name: z
    .string()
    .trim()
    .min(2, "Nama bidang minimal 2 karakter.")
    .max(100, "Nama bidang maksimal 100 karakter."),
});

export type FieldUpdateInput = z.infer<typeof fieldUpdateSchema>;

// ---- Kelas (Class) ---------------------------------------------------------

/** Create only picks Batch + Bidang; the class letter is server-assigned. */
export const classCreateSchema = z.object({
  batchId: cuid,
  fieldId: cuid,
});

export type ClassCreateInput = z.infer<typeof classCreateSchema>;

/** Edit only adjusts capacity. */
export const classUpdateSchema = z.object({
  maxStudents: z
    .number()
    .int("Kapasitas harus berupa angka bulat.")
    .min(1, "Kapasitas minimal 1.")
    .max(100, "Kapasitas maksimal 100."),
});

export type ClassUpdateInput = z.infer<typeof classUpdateSchema>;
