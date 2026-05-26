import { NextResponse, type NextRequest } from "next/server";

import { mapTransactionStatus, verifyMidtransSignature } from "@/lib/midtrans";
import { fulfillOrderPaid } from "@/lib/payment/fulfillment";
import { prisma } from "@/lib/prisma";
import { midtransWebhookSchema } from "@/lib/validators/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payment/webhook — Midtrans payment notification handler (PRD §6.4.7).
 *
 * Security & correctness:
 *   1. Validate body shape.
 *   2. Verify the SHA512 signature — reject forgeries (403). Invalid-signature
 *      attempts are logged but NOT persisted, to avoid DB bloat from spam.
 *   3. Confirm the notified amount matches the order's finalPrice.
 *   4. Idempotency + immutability: a SUCCESS order is never changed; re-deliveries
 *      are no-ops (enrollment upsert is idempotent too).
 *   5. Map transaction_status → OrderStatus; SUCCESS fulfils the order.
 *
 * Always answers 200 for handled/ignored cases so Midtrans stops retrying;
 * only signature failure (403) and unexpected errors (500 → Midtrans retries)
 * deviate.
 *
 * Public endpoint (no session) — authenticity comes from the signature.
 */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = midtransWebhookSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
  }

  const n = parsed.data;

  // 2. Signature verification — the authenticity gate.
  const validSignature = verifyMidtransSignature({
    orderId: n.order_id,
    statusCode: n.status_code,
    grossAmount: n.gross_amount,
    signatureKey: n.signature_key,
  });
  if (!validSignature) {
    console.warn(`[midtrans webhook] invalid signature for order_id=${n.order_id}`);
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  try {
    // Persist the (authenticated) event for audit / idempotency tracing.
    const order = await prisma.order.findUnique({
      where: { paymentInvoiceId: n.order_id },
      select: { id: true, status: true, finalPrice: true },
    });

    const event = await prisma.paymentWebhookEvent.create({
      data: {
        orderId: order?.id ?? null,
        provider: "MIDTRANS",
        externalId: n.order_id,
        signature: n.signature_key,
        payload: raw as object,
      },
      select: { id: true },
    });

    const finish = (processingErr?: string) =>
      prisma.paymentWebhookEvent.update({
        where: { id: event.id },
        data: { processedAt: new Date(), processingErr: processingErr ?? null },
      });

    // 3. Unknown order — ack so Midtrans stops retrying.
    if (!order) {
      await finish("order not found");
      console.warn(`[midtrans webhook] no order for order_id=${n.order_id}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 4. Amount tampering check.
    const notifiedAmount = Math.round(Number.parseFloat(n.gross_amount));
    if (notifiedAmount !== order.finalPrice) {
      await finish(`amount mismatch: notified=${notifiedAmount} expected=${order.finalPrice}`);
      console.warn(
        `[midtrans webhook] amount mismatch order=${n.order_id} notified=${notifiedAmount} expected=${order.finalPrice}`,
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 5. Immutability: SUCCESS is terminal.
    if (order.status === "SUCCESS") {
      await finish("already success");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const next = mapTransactionStatus({
      transactionStatus: n.transaction_status,
      fraudStatus: n.fraud_status,
    });

    if (next === "SUCCESS") {
      const paidAt = n.transaction_time ? new Date(n.transaction_time) : new Date();
      await fulfillOrderPaid(order.id, { paidAt });
    } else if (next === "FAILED" || next === "EXPIRED") {
      await prisma.order.update({ where: { id: order.id }, data: { status: next } });
    }
    // PENDING / ignore → leave the order untouched.

    await finish();
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    // 500 → Midtrans will retry, which is safe because the handler is idempotent.
    console.error("[midtrans webhook] processing error", err);
    return NextResponse.json({ error: "Processing error." }, { status: 500 });
  }
}
