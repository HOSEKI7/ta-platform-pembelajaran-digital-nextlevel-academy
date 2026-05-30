import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { PasswordChangedEmail } from "@/emails/password-changed";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { VerifyEmail } from "@/emails/verify-email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

// PRD §6.1.1: password must contain upper-case, lower-case, and a digit; min 8.
const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_COMPLEXITY_MESSAGE =
  "Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, dan angka.";

// PRD §11.3 rate-limit envelopes. Windows are expressed in seconds.
const FIFTEEN_MINUTES = 15 * 60;
const ONE_HOUR = 60 * 60;

export const auth = betterAuth({
  baseURL: env.betterAuth.url(),
  secret: env.betterAuth.secret(),

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // ---- Identity model ------------------------------------------------------
  // Surface our domain fields on session.user so role-based gating works
  // without an extra Prisma lookup. `input: false` keeps them out of the
  // public sign-up body — role/isActive are server-managed.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "PESERTA_DIDIK",
        input: false,
      },
      username: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      // Surfaced on session.user so the student layout can force a password
      // change (set by admin's "Set Password Sementara" action — PRD §6.11.4)
      // without an extra DB lookup. Server-managed only.
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
    // PRD §6.1.4: changing email triggers a verification flow before the
    // new address takes effect. We intentionally OMIT
    // `sendChangeEmailConfirmation` (current-email approval) so Better Auth
    // falls through to its third branch and sends a verification link to the
    // *new* email via `emailVerification.sendVerificationEmail` below. The
    // user's email is only swapped once the new address is verified.
    changeEmail: {
      enabled: true,
    },
  },

  // ---- Email + password ----------------------------------------------------
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false, // user must verify their email before logging in
    resetPasswordTokenExpiresIn: ONE_HOUR, // PRD §6.1.3
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset Password — NextLevel Academy",
        react: ResetPasswordEmail({ name: user.name ?? user.email, resetUrl: url }),
      });
    },
    onPasswordReset: async ({ user }) => {
      // PRD §6.1.4: notify the user when their password changes.
      await sendEmail({
        to: user.email,
        subject: "Password Anda Telah Diubah",
        react: PasswordChangedEmail({
          name: user.name ?? user.email,
          changedAt: new Date().toISOString(),
        }),
      });
    },
  },

  // ---- Email verification --------------------------------------------------
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verifikasi Email Anda — NextLevel Academy",
        react: VerifyEmail({ name: user.name ?? user.email, verifyUrl: url }),
      });
    },
  },

  // ---- Sessions ------------------------------------------------------------
  // Sessions live in HTTP-only cookies (PRD §11.1). Better Auth's default
  // expiresIn is 7 days; we extend to 30 days with a 1-day refresh window so
  // returning users don't get bounced.
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes of trust before re-reading the DB
    },
  },

  // ---- Account ------------------------------------------------------------
  // Sign-ups always create a fresh session-eligible account; the
  // `accountLinking` defaults are fine for email/password only.
  account: {
    accountLinking: {
      enabled: false,
    },
  },

  // ---- Rate limiting (PRD §11.3) ------------------------------------------
  // The built-in limiter counts every request (not just failures), which is
  // a stricter envelope than the PRD asks for — acceptable for v1.0 and
  // refinable later via a custom storage hook.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 200, // general endpoints: 200 req/min/IP
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: FIFTEEN_MINUTES, max: 5 },
      "/sign-up/email": { window: ONE_HOUR, max: 10 },
      "/forget-password": { window: ONE_HOUR, max: 3 },
      "/reset-password": { window: ONE_HOUR, max: 5 },
      "/send-verification-email": { window: ONE_HOUR, max: 5 },
    },
  },

  // ---- Trusted origins -----------------------------------------------------
  trustedOrigins: [env.appUrl()],

  // ---- Lifecycle hooks -----------------------------------------------------
  // Password complexity isn't a built-in Better Auth option, so we enforce it
  // in a `before` middleware on the relevant endpoints. Runs before the user
  // is created / password is hashed, so we still have plaintext to validate.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const passwordPaths = new Set([
        "/sign-up/email",
        "/reset-password",
        "/change-password",
      ]);
      if (!passwordPaths.has(ctx.path)) return;

      const body = ctx.body as { password?: unknown; newPassword?: unknown } | undefined;
      const candidate =
        typeof body?.newPassword === "string"
          ? body.newPassword
          : typeof body?.password === "string"
            ? body.password
            : undefined;
      if (typeof candidate !== "string") return;
      if (!PASSWORD_COMPLEXITY.test(candidate)) {
        throw new APIError("BAD_REQUEST", { message: PASSWORD_COMPLEXITY_MESSAGE });
      }
    }),
    // PRD §6.1.4: send a notification email after a successful password
    // change (the user knew the old password — distinct from /reset-password
    // which is already covered by `onPasswordReset`). Failure to send the
    // email must not break the change response — the request already
    // succeeded by the time this hook runs.
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/change-password") return;
      const session = ctx.context.session;
      const userEmail = session?.user?.email;
      const userName = session?.user?.name;
      if (!userEmail) return;
      try {
        await sendEmail({
          to: userEmail,
          subject: "Password Anda Telah Diubah",
          react: PasswordChangedEmail({
            name: userName ?? userEmail,
            changedAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("[auth] failed to send password-changed email", err);
      }
    }),
  },

  // ---- Database hooks ------------------------------------------------------
  // Block sign-in for accounts that have been deactivated via the admin panel
  // (PRD §6.11.4 "Nonaktifkan").
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });
          if (user && !user.isActive) {
            throw new APIError("FORBIDDEN", {
              message: "Akun ini sudah dinonaktifkan. Silakan hubungi admin.",
            });
          }
        },
      },
    },
  },

  // ---- Plugins -------------------------------------------------------------
  // `nextCookies()` must be the LAST plugin so cookies are written on every
  // Server Action / Route Handler response. (Better Auth docs.)
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
