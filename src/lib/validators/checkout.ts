import { z } from "zod";

import { isValidOptionalPhone } from "@/lib/validators/phone";

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

// Optional buyer phone, validated as E.164. A blank string is treated as "not
// provided" and normalized to `undefined` (payment method is chosen in the Snap
// popup now, so it's no longer collected here).
const customerPhoneSchema = z
  .string()
  .trim()
  .refine(isValidOptionalPhone, "Nomor telepon tidak valid.")
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const createOrderSchema = z.object({
  courseId: z.string().min(1, "Course wajib diisi."),
  voucherCode: voucherCodeSchema.optional(),
  customerPhone: customerPhoneSchema,
  agreedToTerms: z
    .boolean()
    .refine((v) => v, "Kamu harus menyetujui Syarat & Ketentuan."),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
