import { z } from "zod";

import { isValidAvatarPath } from "@/lib/avatars";

// PRD §6.1.4: username (unique), nama lengkap, email, foto profil.
// Password complexity mirrors `validators/auth.ts` (PRD §6.1.1).

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;
export const USERNAME_PATTERN = /^[a-z0-9._]+$/;

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(128, "Password terlalu panjang.")
  .regex(/[A-Z]/, "Password harus mengandung minimal satu huruf besar.")
  .regex(/[a-z]/, "Password harus mengandung minimal satu huruf kecil.")
  .regex(/\d/, "Password harus mengandung minimal satu angka.");

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Username minimal ${USERNAME_MIN} karakter.`)
  .max(USERNAME_MAX, `Username maksimal ${USERNAME_MAX} karakter.`)
  .regex(
    USERNAME_PATTERN,
    "Username hanya boleh berisi huruf kecil, angka, titik, atau garis bawah.",
  );

export const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN, `Nama lengkap minimal ${NAME_MIN} karakter.`)
  .max(NAME_MAX, `Nama lengkap maksimal ${NAME_MAX} karakter.`);

/**
 * Profile avatar — must be one of the registered preset paths (see
 * `@/lib/avatars`) or `null` to fall back to initials. This is an allowlist,
 * so arbitrary URLs can no longer be injected into `user.image`.
 */
export const imageAvatarSchema = z
  .string()
  .refine((p) => isValidAvatarPath(p), "Avatar tidak valid.")
  .nullable()
  .optional();

/**
 * Profile update — at least one field required. Image accepts `null` to mean
 * "remove avatar" (use initials).
 */
export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    username: usernameSchema.optional(),
    image: imageAvatarSchema,
  })
  .refine(
    (v) =>
      v.name !== undefined ||
      v.username !== undefined ||
      v.image !== undefined,
    { message: "Tidak ada perubahan untuk disimpan." },
  );
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid.")
    .max(254, "Email terlalu panjang."),
});
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok.",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "Password baru tidak boleh sama dengan yang lama.",
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
