import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import midtransClient, { type Snap } from "midtrans-client";

import { env } from "@/lib/env";

/**
 * Server-side Midtrans Snap integration (PRD §6.4).
 *
 * We use **Snap** (popup) rather than Core API: Midtrans hosts the actual
 * payment instructions UI, which keeps PCI scope and per-channel edge cases out
 * of our codebase. Our own `/payment/[orderId]` page provides the branding,
 * order summary and 60-minute countdown, then launches `snap.pay(token)`.
 *
 * The Server Key never leaves the server. Only the client key is exposed
 * (NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) for snap.js.
 */

const globalForMidtrans = globalThis as unknown as { midtransSnap?: Snap };

export function isMidtransConfigured(): boolean {
  return env.midtrans.isConfigured();
}

/** Memoized Snap client. Throws if keys are missing — callers must guard with `isMidtransConfigured()`. */
function getSnap(): Snap {
  if (globalForMidtrans.midtransSnap) return globalForMidtrans.midtransSnap;

  const serverKey = env.midtrans.serverKey();
  const clientKey = env.midtrans.clientKey();
  if (!serverKey || !clientKey) {
    throw new Error("Midtrans is not configured (missing server/client key).");
  }

  const snap = new midtransClient.Snap({
    isProduction: env.midtrans.isProduction(),
    serverKey,
    clientKey,
  });
  globalForMidtrans.midtransSnap = snap;
  return snap;
}

export type CreateSnapInput = {
  /** Midtrans `order_id`. We use the human-readable invoice number. Must be unique, ≤50 chars. */
  orderId: string;
  /** Whole IDR rupiah. Must equal the sum of item prices. */
  grossAmount: number;
  itemId: string;
  itemName: string;
  customer: { name: string; email: string };
  /** Snap `enabled_payments` codes; omit to show every channel. */
  enabledPayments?: string[];
  /** Where Snap redirects after the user finishes (used by redirect-mode channels). */
  finishUrl: string;
  /** Minutes until the Snap transaction expires (matches our Order.expiresAt). */
  expiryMinutes: number;
};

/** Creates a Snap transaction and returns the token + redirect URL. */
export async function createSnapTransaction(
  input: CreateSnapInput,
): Promise<{ token: string; redirectUrl: string }> {
  const snap = getSnap();

  // Midtrans truncates long item names; keep it well under the 50-char cap.
  const itemName =
    input.itemName.length > 50 ? `${input.itemName.slice(0, 47)}...` : input.itemName;
  const [firstName, ...rest] = input.customer.name.trim().split(/\s+/);

  const parameter: Record<string, unknown> = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    item_details: [
      {
        id: input.itemId,
        price: input.grossAmount,
        quantity: 1,
        name: itemName,
      },
    ],
    customer_details: {
      first_name: firstName || "Peserta",
      last_name: rest.join(" ") || undefined,
      email: input.customer.email,
    },
    expiry: { unit: "minutes", duration: input.expiryMinutes },
    callbacks: { finish: input.finishUrl },
    custom_field1: input.orderId,
  };

  if (input.enabledPayments && input.enabledPayments.length > 0) {
    parameter.enabled_payments = input.enabledPayments;
  }

  const result = await snap.createTransaction(parameter);
  return { token: result.token, redirectUrl: result.redirect_url };
}

/**
 * Verifies the Midtrans notification signature (PRD §6.4.7).
 *
 *   signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
 *
 * Uses a constant-time comparison. Returns false (never throws) when keys are
 * missing so the webhook can answer 403 cleanly.
 */
export function verifyMidtransSignature(args: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = env.midtrans.serverKey();
  if (!serverKey) return false;

  const expected = createHash("sha512")
    .update(args.orderId + args.statusCode + args.grossAmount + serverKey)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(args.signatureKey, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Maps a checkout payment-method id (see src/lib/payment-methods.ts) to its
 * Snap `enabled_payments` code. Methods Snap does not expose as a standalone
 * channel (e.g. OVO, DANA) return `null` — we then leave `enabled_payments`
 * unset so the user can still pick a channel inside the Snap popup.
 */
const SNAP_PAYMENT_MAP: Record<string, string> = {
  qris: "qris",
  gopay: "gopay",
  shopeepay: "shopeepay",
  bca_va: "bca_va",
  bni_va: "bni_va",
  bri_va: "bri_va",
  mandiri_va: "echannel", // Mandiri Bill via Snap
  indomaret: "indomaret",
  alfamart: "alfamart",
};

export function mapPaymentMethodToSnap(methodId: string): string[] | null {
  const code = SNAP_PAYMENT_MAP[methodId];
  return code ? [code] : null;
}

export type NormalizedStatus = "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED" | "ignore";

/**
 * Normalizes Midtrans `transaction_status` (+ `fraud_status` for cards) into
 * our OrderStatus. `ignore` means "no state change" (e.g. card capture pending
 * fraud review). See Midtrans notification docs.
 */
export function mapTransactionStatus(args: {
  transactionStatus: string;
  fraudStatus?: string;
}): NormalizedStatus {
  const { transactionStatus, fraudStatus } = args;

  switch (transactionStatus) {
    case "capture":
      if (fraudStatus === "accept") return "SUCCESS";
      if (fraudStatus === "challenge") return "ignore";
      return "FAILED";
    case "settlement":
      return "SUCCESS";
    case "pending":
      return "PENDING";
    case "expire":
      return "EXPIRED";
    case "deny":
    case "cancel":
    case "failure":
      return "FAILED";
    default:
      return "ignore";
  }
}
