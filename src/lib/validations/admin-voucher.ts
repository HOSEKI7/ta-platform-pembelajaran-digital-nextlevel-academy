import { z } from "zod";

/**
 * Shared Zod schemas for the admin "Buat/Edit Voucher" flow (PRD §6.11.6).
 * Used client-side (react-hook-form resolver) and server-side (route handlers).
 *
 * Kept "concrete" (no `z.coerce` / `.default()`) so the schema's input and
 * output types match — that lets the react-hook-form `zodResolver` type cleanly
 * against the form values. The client form supplies real numbers; date fields
 * travel as ISO strings (converted from WIB `datetime-local` on submit).
 */

// Voucher codes are case-sensitive (consistent with checkout `validateVoucher`
// and PRD §6.7 system codes). Same charset as the checkout voucher code.
export const VOUCHER_CODE_REGEX = /^[A-Za-z0-9_-]+$/;

export const VOUCHER_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type VoucherDiscountTypeValue = (typeof VOUCHER_DISCOUNT_TYPES)[number];

const codeSchema = z
  .string()
  .trim()
  .min(3, "Kode voucher minimal 3 karakter.")
  .max(64, "Kode voucher maksimal 64 karakter.")
  .regex(
    VOUCHER_CODE_REGEX,
    "Kode hanya boleh huruf, angka, '_' dan '-' (tanpa spasi).",
  );

/**
 * Core voucher fields. Discriminated by `discountType`:
 *  - PERCENTAGE → `discountPct` 1–100, `discountAmount` ignored (null)
 *  - FIXED      → `discountAmount` ≥ 1 (rupiah), `discountPct` ignored (0)
 *
 * `startDate` optional (empty → server stamps `now()` = aktif seketika).
 * `endDate` required and must be after start + in the future.
 */
const baseVoucherSchema = z
  .object({
    code: codeSchema,
    description: z.string().trim().max(200, "Deskripsi maksimal 200 karakter."),
    discountType: z.enum(VOUCHER_DISCOUNT_TYPES),
    discountPct: z.number().int("Persentase harus bilangan bulat."),
    discountAmount: z.number().int("Nominal harus bilangan bulat.").nullable(),
    maxUsage: z
      .number()
      .int("Batas pemakaian harus bilangan bulat.")
      .min(1, "Batas pemakaian minimal 1.")
      .nullable(),
    /** ISO string, or empty string when "aktif seketika". */
    startDate: z.string().trim(),
    /** ISO string — required. */
    endDate: z.string().trim().min(1, "Tanggal berakhir wajib diisi."),
  })
  .superRefine((d, ctx) => {
    if (d.discountType === "PERCENTAGE") {
      if (d.discountPct < 1 || d.discountPct > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountPct"],
          message: "Persentase harus antara 1–100.",
        });
      }
    } else {
      if (d.discountAmount == null || d.discountAmount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountAmount"],
          message: "Nominal diskon minimal Rp1.",
        });
      }
    }

    const end = new Date(d.endDate);
    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Tanggal berakhir tidak valid.",
      });
      return;
    }
    if (d.startDate) {
      const start = new Date(d.startDate);
      if (Number.isNaN(start.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "Tanggal mulai tidak valid.",
        });
      } else if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Tanggal berakhir harus setelah tanggal mulai.",
        });
      }
    }
  });

export const voucherFormSchema = baseVoucherSchema;
export type VoucherFormInput = z.infer<typeof baseVoucherSchema>;

/** Toggle voucher active/inactive (deactivate / reactivate). */
export const voucherStatusSchema = z.object({
  isActive: z.boolean(),
});
export type VoucherStatusInput = z.infer<typeof voucherStatusSchema>;
