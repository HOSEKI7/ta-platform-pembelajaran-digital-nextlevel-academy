import { z } from "zod";

// PRD §6.1.1: password ≥ 8 chars and contains upper-case, lower-case, and digit.
const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(64, "Password maksimal 64 karakter.")
  .regex(/[A-Z]/, "Password harus mengandung minimal satu huruf besar.")
  .regex(/[a-z]/, "Password harus mengandung minimal satu huruf kecil.")
  .regex(/\d/, "Password harus mengandung minimal satu angka.");

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama lengkap minimal 2 karakter."),
    email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
    agreedToTerms: z
      .boolean()
      .refine((v) => v, "Kamu harus menyetujui Kebijakan Privasi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok.",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok.",
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
