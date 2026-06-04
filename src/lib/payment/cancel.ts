import "server-only";

import { cancelMidtransTransaction, isMidtransConfigured } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

/**
 * Student self-cancel of a PENDING order (PRD §6.4).
 *
 * A buyer who picked the wrong method can cancel immediately instead of waiting
 * out the 60-minute expiry, then start a fresh checkout. The order is flipped to
 * `CANCELED` (distinct from FAILED, which is a gateway/admin rejection). No
 * enrollment is granted and no notification is sent — the buyer did this
 * themselves. Best-effort cancels the Midtrans transaction first so any
 * already-issued VA/QR is voided server-side.
 *
 * Scoped by `userId`: an order owned by someone else resolves to `not_found`,
 * so order ids can't be canceled across accounts.
 */

export type CancelOrderFailureReason =
  | "not_found"
  | "already_success"
  | "not_pending"
  | "error";

export type CancelOrderResult =
  | { ok: true }
  | { ok: false; reason: CancelOrderFailureReason };

/** Maps a cancel-failure reason to its HTTP status + user-facing message. */
export function describeCancelFailure(reason: CancelOrderFailureReason): {
  status: number;
  error: string;
} {
  switch (reason) {
    case "not_found":
      return { status: 404, error: "Transaksi tidak ditemukan." };
    case "already_success":
      return {
        status: 409,
        error: "Pembayaran sudah berhasil dan tidak dapat dibatalkan.",
      };
    case "not_pending":
      return {
        status: 409,
        error: "Hanya pembayaran yang menunggu yang dapat dibatalkan.",
      };
    case "error":
      return { status: 500, error: "Gagal membatalkan pembayaran. Coba lagi." };
  }
}

export async function cancelPendingOrder(args: {
  orderId: string;
  userId: string;
  ip?: string | null;
  ua?: string | null;
}): Promise<CancelOrderResult> {
  const { orderId, userId } = args;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true, paymentInvoiceId: true },
  });

  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "SUCCESS") return { ok: false, reason: "already_success" };
  if (order.status !== "PENDING") return { ok: false, reason: "not_pending" };

  // Best-effort: void the Midtrans transaction so a stale VA/QR can't be paid
  // after the buyer checks out again. Failure here is non-fatal — local state wins.
  if (isMidtransConfigured() && order.paymentInvoiceId) {
    await cancelMidtransTransaction(order.paymentInvoiceId);
  }

  try {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELED" },
      }),
      prisma.auditLog.create({
        data: {
          actorId: userId,
          action: "ORDER_CANCEL_SELF",
          entityType: "Order",
          entityId: orderId,
          metadata: { oldStatus: "PENDING", newStatus: "CANCELED" },
          ipAddress: args.ip ?? null,
          userAgent: args.ua ?? null,
        },
      }),
    ]);
  } catch (err) {
    console.error("[cancelPendingOrder] failed", err);
    return { ok: false, reason: "error" };
  }

  return { ok: true };
}
