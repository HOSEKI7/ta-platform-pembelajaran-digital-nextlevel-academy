import "server-only";

import type { OrderStatus } from "@/generated/prisma";
import {
  fetchMidtransTransactionStatus,
  isMidtransConfigured,
  mapTransactionStatus,
} from "@/lib/midtrans";
import { fulfillOrderPaid } from "@/lib/payment/fulfillment";
import { prisma } from "@/lib/prisma";

/**
 * The minimal order fields `reconcileOrder` needs. Callers already load these
 * in their own query, so they pass the object in to avoid a duplicate read.
 */
export type ReconcileOrderInput = {
  id: string;
  status: OrderStatus;
  paymentInvoiceId: string | null;
  finalPrice: number;
  expiresAt: Date;
};

/**
 * Brings a PENDING order's status in line with reality, WITHOUT depending on the
 * Midtrans webhook (PRD §6.4). The webhook is the happy path; this is the
 * safety net for when it never arrives — local dev (no public URL), dropped
 * notifications, or a missing cron.
 *
 * For a PENDING order it:
 *   1. asks Midtrans for the real transaction status (when configured),
 *   2. on a paid+amount-matching transaction, runs the shared `fulfillOrderPaid`
 *      (flip → SUCCESS, grant Enrollment, email) — idempotent,
 *   3. on a failed/expired transaction, writes that terminal status,
 *   4. otherwise lazily expires the order once its 60-minute window has passed
 *      (this also covers the dev fallback where Midtrans isn't configured).
 *
 * Returns the resulting status. Terminal orders are returned untouched.
 */
export async function reconcileOrder(order: ReconcileOrderInput): Promise<OrderStatus> {
  if (order.status !== "PENDING") return order.status;

  if (isMidtransConfigured() && order.paymentInvoiceId) {
    const info = await fetchMidtransTransactionStatus(order.paymentInvoiceId);
    if (info) {
      const notifiedAmount = Math.round(Number.parseFloat(info.grossAmount));
      const amountOk =
        Number.isFinite(notifiedAmount) && notifiedAmount === order.finalPrice;

      const next = mapTransactionStatus({
        transactionStatus: info.transactionStatus,
        fraudStatus: info.fraudStatus,
      });

      // Mirror the webhook's amount-tampering guard before granting access.
      if (next === "SUCCESS" && amountOk) {
        const paidAt = info.transactionTime ? new Date(info.transactionTime) : new Date();
        await fulfillOrderPaid(order.id, { paymentMethod: info.paymentType, paidAt });
        return "SUCCESS";
      }
      if (next === "FAILED" || next === "EXPIRED") {
        await prisma.order.update({ where: { id: order.id }, data: { status: next } });
        return next;
      }
      // PENDING / ignore / amount mismatch → fall through to the local expiry check.
    }
  }

  // Lazy expiry: self-heal even without Midtrans/cron once the window lapses.
  if (order.expiresAt.getTime() < Date.now()) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "EXPIRED" } });
    return "EXPIRED";
  }

  return "PENDING";
}
