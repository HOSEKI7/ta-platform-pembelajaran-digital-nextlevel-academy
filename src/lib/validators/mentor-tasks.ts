import { z } from "zod";

// PRD §6.9.3 — mentor membuat tugas: judul, deskripsi (rich-text HTML),
// tenggat (tanggal + jam WIB). Lampiran divalidasi terpisah (multipart) seperti
// alur submit peserta. Schema dipakai bersama klien (react-hook-form) + server.

export const TASK_TITLE_MIN = 3;
export const TASK_TITLE_MAX = 150;

/** Wall-clock WIB dari date-time picker, mis. "2026-06-10T17:30". */
export const DEADLINE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Plain-text panjang konten setelah membuang tag + entitas dasar. */
export function htmlToPlainLength(html: string): number {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim().length;
}

export const titleSchema = z
  .string()
  .trim()
  .min(TASK_TITLE_MIN, `Judul minimal ${TASK_TITLE_MIN} karakter.`)
  .max(TASK_TITLE_MAX, `Judul maksimal ${TASK_TITLE_MAX} karakter.`);

export const descriptionSchema = z
  .string()
  .max(50_000, "Deskripsi terlalu panjang.")
  .refine((html) => htmlToPlainLength(html) > 0, {
    message: "Deskripsi tugas wajib diisi.",
  });

export const deadlineSchema = z
  .string()
  .regex(DEADLINE_PATTERN, "Tanggal dan jam tenggat wajib dipilih.");

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  deadline: deadlineSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
