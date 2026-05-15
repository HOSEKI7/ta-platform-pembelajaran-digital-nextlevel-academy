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
} as const;
