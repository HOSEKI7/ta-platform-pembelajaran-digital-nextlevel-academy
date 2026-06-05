/**
 * Centralised, type-safe access to runtime environment variables.
 *
 * Reads from process.env. Next.js automatically loads .env.local; the Prisma
 * CLI / scripts load it explicitly via prisma.config.ts and dotenv.
 *
 * Missing values throw at call time (not import time) so a misconfigured email
 * key doesn't crash unrelated routes at boot.
 */

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readOptional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export const env = {
  appUrl: () => readRequired("NEXT_PUBLIC_APP_URL"),

  betterAuth: {
    secret: () => readRequired("BETTER_AUTH_SECRET"),
    url: () => process.env.BETTER_AUTH_URL ?? readRequired("NEXT_PUBLIC_APP_URL"),
  },

  resend: {
    apiKey: () => readOptional("RESEND_API_KEY"),
    from: () =>
      readOptional("RESEND_FROM_EMAIL") ?? "NextLevel Academy <onboarding@resend.dev>",
  },

  supabase: {
    url: () => readRequired("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: () => readRequired("SUPABASE_SERVICE_ROLE_KEY"),
    /** Public bucket used for user avatars. */
    avatarBucket: () => readOptional("SUPABASE_AVATAR_BUCKET") ?? "avatars",
  },

  midtrans: {
    serverKey: () => readOptional("MIDTRANS_SERVER_KEY"),
    /** Browser-safe client key. Prefer the public var, fall back to the server one. */
    clientKey: () =>
      readOptional("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY") ??
      readOptional("MIDTRANS_CLIENT_KEY"),
    merchantId: () => readOptional("MIDTRANS_MERCHANT_ID"),
    isProduction: () => process.env.MIDTRANS_IS_PRODUCTION === "true",
    /**
     * True only when both keys are present. When false the payment flow uses a
     * simulated fallback (see src/lib/payment/fulfillment.ts) so the whole flow
     * stays testable locally without real credentials.
     */
    isConfigured: () =>
      Boolean(
        readOptional("MIDTRANS_SERVER_KEY") &&
          (readOptional("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY") ??
            readOptional("MIDTRANS_CLIENT_KEY")),
      ),
  },

  cronSecret: () => readOptional("CRON_SECRET"),

  adminInvite: {
    /** Validity window for an admin invitation link, in hours (default 24). */
    expiryHours: () => {
      const raw = readOptional("ADMIN_INVITE_EXPIRY_HOURS");
      const n = raw ? Number(raw) : Number.NaN;
      return Number.isFinite(n) && n > 0 ? n : 24;
    },
  },
} as const;
