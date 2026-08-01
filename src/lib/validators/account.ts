import { z } from "zod";

// PRD §6.1.4: username (unique), nama lengkap, email, foto profil.
// Password complexity mirrors `validators/auth.ts` (PRD §6.1.1).

export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 15;
export const USERNAME_PATTERN = /^[a-z0-9._]+$/;
export const INSTITUTION_MIN = 2;
export const INSTITUTION_MAX = 150;

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(64, "Password maksimal 64 karakter.")
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
 * Profile avatar — a preset path under `/avatars/`, or `null` for initials.
 * This is a client-safe **shape** guard; the route handler additionally checks
 * membership against the live preset list (`loadAvatarPaths()` in
 * `@/lib/avatars`), so arbitrary URLs can't be injected into `user.image`.
 */
export const imageAvatarSchema = z
  .string()
  .regex(
    /^\/avatars\/[\w.-]+\.(?:webp|png|jpe?g|svg)$/i,
    "Avatar tidak valid.",
  )
  .max(256, "Path avatar terlalu panjang.")
  .nullable()
  .optional();

/**
 * Institution (institusi) — only the Peserta Magang surface sends this, and the
 * route enforces the one-time/locked rule server-side (see profile route).
 */
export const institutionSchema = z
  .string()
  .trim()
  .min(INSTITUTION_MIN, `Institusi minimal ${INSTITUTION_MIN} karakter.`)
  .max(INSTITUTION_MAX, `Institusi maksimal ${INSTITUTION_MAX} karakter.`);

/**
 * Profile update — at least one field required. Image accepts `null` to mean
 * "remove avatar" (use initials).
 */
export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    username: usernameSchema.optional(),
    image: imageAvatarSchema,
    institution: institutionSchema.optional(),
  })
  .refine(
    (v) =>
      v.name !== undefined ||
      v.username !== undefined ||
      v.image !== undefined ||
      v.institution !== undefined,
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
