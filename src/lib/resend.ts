import type { ReactElement } from "react";
import { Resend } from "resend";

import { env } from "@/lib/env";

const globalForResend = globalThis as unknown as { resend?: Resend };

function getClient(): Resend | null {
  const apiKey = env.resend.apiKey();
  if (!apiKey) return null;
  globalForResend.resend ??= new Resend(apiKey);
  return globalForResend.resend;
}

export type SendEmailArgs = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  /** Optional plaintext fallback. Resend renders the React component to HTML; some clients prefer text/plain. */
  text?: string;
  /** Override the From header for this message. Defaults to RESEND_FROM_EMAIL. */
  from?: string;
};

/**
 * Send a transactional email via Resend.
 *
 * Behaviour when RESEND_API_KEY is not set (common in local dev): logs the
 * subject and to-list to the console and returns `{ dryRun: true }` so the
 * calling flow (signup, password reset, etc.) still succeeds end-to-end. This
 * keeps developer onboarding friction-free.
 */
export async function sendEmail(args: SendEmailArgs): Promise<
  { dryRun: true } | { id: string }
> {
  const client = getClient();
  const from = args.from ?? env.resend.from();

  if (!client) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[resend] RESEND_API_KEY not set — skipping email send. ` +
          `to=${Array.isArray(args.to) ? args.to.join(",") : args.to} subject="${args.subject}"`,
      );
    }
    return { dryRun: true };
  }

  const result = await client.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    react: args.react,
    text: args.text,
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
  return { id: result.data!.id };
}
