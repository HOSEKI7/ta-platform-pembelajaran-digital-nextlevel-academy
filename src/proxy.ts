import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-runtime middleware. Cannot query Prisma, so it only does the cheap
 * "is the request authenticated at all?" check via the session cookie.
 * Role-based gating runs in Server Components via `requireRole()` from
 * `@/lib/auth-server` (Node runtime, full DB access).
 *
 * Routing rules per PRD §5:
 *   /dashboard, /my-courses, /learn, /certificates, /exp-level, /transactions,
 *   /settings        → any authenticated user (role gate in RSC)
 *   /internship/*    → any authenticated user (role gate to PESERTA_MAGANG in RSC)
 *   /mentor/*        → any authenticated user (role gate to MENTOR in RSC)
 *   /admin/*         → any authenticated user (role gate to ADMINISTRATOR in RSC)
 *   /login, /register, /forgot-password, /reset-password
 *                    → authenticated users get bounced to /dashboard
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/my-courses",
  "/learn",
  "/certificates",
  "/exp-level",
  "/transactions",
  "/settings",
  "/internship",
  "/mentor",
  "/admin",
];

const AUTH_PAGES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const hasSession = Boolean(sessionCookie);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, static assets, the auth handler itself, and
  // public verification endpoints. The PRD lists `/verify/:certificateId` as
  // publicly accessible — we don't gate it here either.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)$).*)",
  ],
};
