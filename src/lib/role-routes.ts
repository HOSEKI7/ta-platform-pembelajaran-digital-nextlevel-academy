import { Role } from "@/generated/prisma";

/**
 * Maps a user role to its dashboard landing route. Each role-surface lives in
 * its own App Router route group (PRD §5), so the post-login redirect must be
 * role-aware — a bare `/dashboard` resolves into the `(student)` group and
 * bounces non-students back to `/` via `requireRole(PESERTA_DIDIK)`.
 *
 * Client-safe (pure, no `server-only`): used by both the login form (client)
 * and the `(auth)` layout (server). Accepts the `Role` enum or a loose string
 * (Better Auth's `session.user.role` is typed as a string in some contexts).
 */
export function dashboardPathForRole(role: Role | string | null | undefined): string {
  switch (role) {
    case Role.PESERTA_MAGANG:
      return "/internship/dashboard";
    case Role.MENTOR:
      return "/mentor/dashboard";
    case Role.ADMINISTRATOR:
      return "/admin/dashboard";
    case Role.PESERTA_DIDIK:
    default:
      return "/dashboard";
  }
}
