import { z } from "zod";

import { PAYMENT_METHOD_IDS } from "@/lib/payment-methods";

// Voucher codes are case-sensitive per PRD §6.7 (system-generated codes use
// random case to prevent guessing). Keep the user's exact casing.
const voucherCodeSchema = z
  .string()
  .trim()
  .min(3, "Kode promo terlalu pendek.")
  .max(64, "Kode promo terlalu panjang.")
  .regex(/^[A-Za-z0-9_-]+$/, "Kode promo hanya boleh huruf, angka, '_' dan '-'.");

export const validateVoucherSchema = z.object({
  code: voucherCodeSchema,
  courseId: z.string().min(1, "Course wajib diisi."),
});
export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>;

export const createOrderSchema = z.object({
  courseId: z.string().min(1, "Course wajib diisi."),
  paymentMethod: z.enum(PAYMENT_METHOD_IDS, {
    message: "Metode pembayaran tidak valid.",
  }),
  voucherCode: voucherCodeSchema.optional(),
  agreedToTerms: z
    .boolean()
    .refine((v) => v, "Kamu harus menyetujui Syarat & Ketentuan."),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
