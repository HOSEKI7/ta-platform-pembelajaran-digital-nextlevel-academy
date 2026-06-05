import { z } from "zod";

import { emailField, nameField, passwordComplexity } from "./admin-user";

/**
 * Shared Zod schemas for the Administrator-account onboarding flow (PRD §6.11.12).
 * Used client-side (react-hook-form resolver) and server-side (route handlers).
 * Prisma-free so it is safe to import into the client bundle.
 */

/** An existing admin invites a new one. Name is optional (recipient confirms it). */
export const inviteAdminSchema = z.object({
  email: emailField,
  name: z.union([nameField, z.literal("")]).optional(),
});
export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;

/** The invitee sets their own name + password on the public accept page. */
export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, "Token undangan tidak valid."),
    name: nameField,
    password: passwordComplexity,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok.",
  });
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

/** Client-form variant (token comes from the URL, not the form fields). */
export const acceptInviteFormSchema = z
  .object({
    name: nameField,
    password: passwordComplexity,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak cocok.",
  });
export type AcceptInviteFormInput = z.infer<typeof acceptInviteFormSchema>;
