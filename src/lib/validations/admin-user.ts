import { z } from "zod";

import { Role } from "@/generated/prisma";

/**
 * Shared Zod schemas for the admin User Management flow (PRD §6.11.4). Used
 * client-side (react-hook-form resolver) and server-side (route handlers).
 *
 * A single flat object + `superRefine` is used (rather than a discriminated
 * union) so one react-hook-form instance can drive the whole form, with
 * role-conditional fields (Kelas for magang/mentor, Institusi for magang).
 */

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const INSTITUTION_MAX = 120;

// PRD §6.1.1: password ≥ 8 chars and contains upper-case, lower-case, and digit.
export const passwordComplexity = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(128, "Password terlalu panjang.")
  .regex(/[A-Z]/, "Password harus mengandung minimal satu huruf besar.")
  .regex(/[a-z]/, "Password harus mengandung minimal satu huruf kecil.")
  .regex(/\d/, "Password harus mengandung minimal satu angka.");

const nameField = z
  .string()
  .trim()
  .min(NAME_MIN, `Nama lengkap minimal ${NAME_MIN} karakter.`)
  .max(NAME_MAX, `Nama lengkap maksimal ${NAME_MAX} karakter.`);

const emailField = z
  .string()
  .trim()
  .min(1, "Email wajib diisi.")
  .email("Format email tidak valid.")
  .max(254, "Email terlalu panjang.");

const usernameField = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter.")
  .max(24, "Username maksimal 24 karakter.")
  .regex(
    /^[a-z0-9._]+$/,
    "Username hanya boleh huruf kecil, angka, titik, atau garis bawah.",
  );

const institutionField = z
  .string()
  .trim()
  .max(INSTITUTION_MAX, `Institusi maksimal ${INSTITUTION_MAX} karakter.`);

/**
 * Mentor gender (optional) — drives the polite "Pak/Bu" greeting on the mentor
 * dashboard. Defined as a string union (not the Prisma enum) to keep this module
 * Prisma-free in the client bundle. An empty/absent value means "not set".
 */
export const GENDER_VALUES = ["MALE", "FEMALE"] as const;
export type GenderValue = (typeof GENDER_VALUES)[number];
const genderField = z.enum(GENDER_VALUES);

/** Roles an admin may create (PRD §6.11.4 — no ADMINISTRATOR via UI). */
export const CREATABLE_ROLE_VALUES = [
  Role.PESERTA_DIDIK,
  Role.PESERTA_MAGANG,
  Role.MENTOR,
] as const;

function needsClass(role: Role): boolean {
  return role === Role.PESERTA_MAGANG || role === Role.MENTOR;
}

/** Create — name/email/password always; classId required for magang/mentor. */
export const createUserSchema = z
  .object({
    role: z.enum(CREATABLE_ROLE_VALUES),
    name: nameField,
    email: emailField,
    password: passwordComplexity,
    classId: z.string().trim().optional(),
    institution: institutionField.optional(),
    // Mentor-only & optional; ignored server-side for non-mentor roles.
    gender: genderField.optional(),
  })
  .superRefine((v, ctx) => {
    if (needsClass(v.role) && !v.classId) {
      ctx.addIssue({
        code: "custom",
        path: ["classId"],
        message: "Kelas wajib dipilih.",
      });
    }
  });
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Edit — role is locked (sent for context only, not changed). `newPassword` is
 * optional and only honored server-side for magang/mentor (Peserta Didik uses
 * the separate "Set Password Sementara" action). An empty string means "no
 * password change".
 */
export const editUserSchema = z
  .object({
    role: z.enum(Role),
    name: nameField,
    email: emailField,
    username: z.union([usernameField, z.literal("")]).optional(),
    classId: z.string().trim().optional(),
    institution: institutionField.optional(),
    // Mentor-only & optional; ignored server-side for non-mentor roles.
    gender: genderField.optional(),
    newPassword: z.union([passwordComplexity, z.literal("")]).optional(),
  })
  .superRefine((v, ctx) => {
    if (needsClass(v.role) && !v.classId) {
      ctx.addIssue({
        code: "custom",
        path: ["classId"],
        message: "Kelas wajib dipilih.",
      });
    }
  });
export type EditUserInput = z.infer<typeof editUserSchema>;

/** Admin sets a temporary password for a Peserta Didik (forces change on login). */
export const setTempPasswordSchema = z.object({
  tempPassword: passwordComplexity,
});
export type SetTempPasswordInput = z.infer<typeof setTempPasswordSchema>;

/** User-facing forced password change after logging in with a temp password. */
export const forcePasswordChangeSchema = z
  .object({
    newPassword: passwordComplexity,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok.",
  });
export type ForcePasswordChangeInput = z.infer<typeof forcePasswordChangeSchema>;
