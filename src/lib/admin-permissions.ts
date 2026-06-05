import { Role } from "@/generated/prisma";

/**
 * Single source of truth for administrator capabilities (PRD §6.11.12).
 *
 * Today the platform has exactly one admin tier (`ADMINISTRATOR`) and all admins
 * are peers. This module exists so that authorization is expressed in terms of
 * *capabilities* rather than a scattered `role === ADMINISTRATOR` check. To add a
 * lower-privilege admin tier later (e.g. `ADMIN_STAF`):
 *   1. add the value to the `Role` enum in `prisma/schema.prisma`,
 *   2. add it to `ADMIN_ROLES`,
 *   3. grant/withhold each capability below.
 * No call site needs to change — they ask the capability, not the role.
 */

/** Every role considered part of the admin surface (gates `/admin/*`). */
export const ADMIN_ROLES = [Role.ADMINISTRATOR] as const;

/** Whether `role` may access the admin app surface at all. */
export function isAdminRole(role: Role): boolean {
  return (ADMIN_ROLES as readonly Role[]).includes(role);
}

/**
 * Whether `role` may manage administrator accounts (invite, activate/deactivate,
 * delete, revoke invites). Restricted to the top tier — a future lower tier would
 * return false here while still being an admin for other purposes.
 */
export function canManageAdmins(role: Role): boolean {
  return role === Role.ADMINISTRATOR;
}

/**
 * Soft cap beyond which the UI surfaces a non-blocking security warning about
 * having too many active administrators (PRD §6.11.12 — over-broad data control).
 */
export const ADMIN_COUNT_WARNING_THRESHOLD = 5;
