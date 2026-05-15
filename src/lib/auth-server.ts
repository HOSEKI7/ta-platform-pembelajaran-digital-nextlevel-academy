import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";

/** Shape of the user returned by Better Auth on session.user, with our domain fields. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  role: Role;
  username?: string | null;
  bio?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSession = {
  user: AuthUser;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

/**
 * Returns the current session, or `null` if the request has no valid session
 * cookie. Safe to call from Server Components, Route Handlers, and Server
 * Actions. Reads the cookie cache when possible (5 min TTL — see auth.ts).
 */
export async function getSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session as AuthSession | null;
}

/**
 * Returns the current session or redirects to /login with a `next` query param
 * set to the requested path. Use this in protected Server Components.
 */
export async function requireAuth(opts?: { redirectTo?: string }): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    const next = opts?.redirectTo;
    const target = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
    redirect(target);
  }
  return session;
}

/**
 * Returns the session if the user has any of `allowed` roles, otherwise
 * redirects to `/` (unauthenticated → /login, authenticated-but-wrong-role
 * → /). Pass a string or array.
 */
export async function requireRole(
  allowed: Role | Role[],
  opts?: { redirectTo?: string },
): Promise<AuthSession> {
  const session = await requireAuth(opts);
  const allowedSet = Array.isArray(allowed) ? new Set(allowed) : new Set([allowed]);
  if (!allowedSet.has(session.user.role)) {
    redirect("/");
  }
  return session;
}

/** Convenience for the admin-panel surface. */
export async function requireAdmin(opts?: { redirectTo?: string }) {
  return requireRole(Role.ADMINISTRATOR, opts);
}

/**
 * Same as `requireRole` but for use in API Route Handlers — instead of a
 * redirect, returns a `Response` you can short-circuit with. Callers do:
 *
 *     const r = await requireRoleInRoute(req, [Role.MENTOR]);
 *     if (r instanceof Response) return r;
 *     const { user } = r;
 */
export async function requireRoleInRoute(
  allowed: Role | Role[],
): Promise<AuthSession | Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const allowedSet = Array.isArray(allowed) ? new Set(allowed) : new Set([allowed]);
  if (!allowedSet.has(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
