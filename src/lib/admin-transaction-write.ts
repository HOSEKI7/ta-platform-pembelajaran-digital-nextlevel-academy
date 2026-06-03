import "server-only";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";
import { fulfillOrderPaid } from "@/lib/payment/fulfillment";

/**
 * Admin-side write operations for the Transaction Management surface
 * (PRD §6.11.5). Each helper guards the order state, performs the mutation, and
 * records the action in `AuditLog` (+ an in-app `Notification` for the student
 * on accept/cancel). The route handlers map the discriminated result to the
 * right HTTP status.
 */

export type AdminActionContext = {
  actorId: string;
  ip: string | null;
  ua: string | null;
};

export type AdminTxnFailureReason =
  | "not_found"
  | "already_success"
  | "not_pending"
  | "error";

export type AdminTxnWriteResult =
  | { ok: true }
  | { ok: false; reason: AdminTxnFailureReason };

/** Maps a write-failure reason to its HTTP status + user-facing message. */
export function describeWriteFailure(reason: AdminTxnFailureReason): {
  status: number;
  error: string;
} {
  switch (reason) {
    case "not_found":
      return { status: 404, error: "Transaksi tidak ditemukan." };
    case "already_success":
      return {
        status: 409,
        error: "Transaksi sudah berhasil dan tidak dapat diubah.",
      };
    case "not_pending":
      return {
        status: 409,
        error: "Hanya transaksi berstatus menunggu yang dapat diproses.",
      };
    case "error":
      return { status: 500, error: "Gagal memproses transaksi. Coba lagi." };
  }
}

type GuardedOrder = {
  id: string;
  userId: string;
  status: string;
  courseTitle: string;
};

/** Loads the order for an action and applies the PENDING-only guard. */
async function loadPendingOrder(
  orderId: string,
): Promise<
  | { ok: true; order: GuardedOrder }
  | { ok: false; reason: "not_found" | "already_success" | "not_pending" }
> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      userId: true,
      status: true,
      course: { select: { title: true } },
    },
  });

  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "SUCCESS") return { ok: false, reason: "already_success" };
  if (order.status !== "PENDING") return { ok: false, reason: "not_pending" };

  return {
    ok: true,
    order: {
      id: order.id,
      userId: order.userId,
      status: order.status,
      courseTitle: order.course.title,
    },
  };
}

/**
 * Accept a PENDING payment: runs the canonical `fulfillOrderPaid` path (flip to
 * SUCCESS, grant the Enrollment, send the confirmation email — identical to a
 * real gateway callback), then records the audit entry + notifies the student.
 */
export async function acceptOrder(
  orderId: string,
  ctx: AdminActionContext,
): Promise<AdminTxnWriteResult> {
  const guard = await loadPendingOrder(orderId);
  if (!guard.ok) return guard;
  const { order } = guard;

  // The admin path sends its own PAYMENT_ACCEPTED below — suppress the generic
  // PURCHASE_SUCCESS so the buyer isn't notified twice for the same event.
  const fulfilled = await fulfillOrderPaid(
    orderId,
    { paidAt: new Date() },
    { suppressPurchaseNotification: true },
  );
  if (!fulfilled.ok) return { ok: false, reason: "not_found" };

  try {
    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          actorId: ctx.actorId,
          action: "ORDER_ACCEPT",
          entityType: "Order",
          entityId: orderId,
          metadata: { oldStatus: "PENDING", newStatus: "SUCCESS" },
          ipAddress: ctx.ip,
          userAgent: ctx.ua,
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          type: NotificationType.PAYMENT_ACCEPTED,
          title: "Pembayaran dikonfirmasi",
          message: `Pembayaran untuk "${order.courseTitle}" telah dikonfirmasi admin. Kursus kini bisa kamu akses.`,
          refId: orderId,
        },
      }),
    ]);
  } catch (err) {
    // The order is already SUCCESS (the thing that matters); a failed audit/notice
    // shouldn't surface as a hard error.
    console.error("[acceptOrder] audit/notification failed", err);
  }

  return { ok: true };
}

/**
 * Cancel a PENDING payment: mark it FAILED (matches a gateway rejection — no
 * enrollment is granted), record the audit entry + notify the student.
 */
export async function cancelOrder(
  orderId: string,
  ctx: AdminActionContext,
): Promise<AdminTxnWriteResult> {
  const guard = await loadPendingOrder(orderId);
  if (!guard.ok) return guard;
  const { order } = guard;

  try {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      }),
      prisma.auditLog.create({
        data: {
          actorId: ctx.actorId,
          action: "ORDER_CANCEL",
          entityType: "Order",
          entityId: orderId,
          metadata: { oldStatus: "PENDING", newStatus: "FAILED" },
          ipAddress: ctx.ip,
          userAgent: ctx.ua,
        },
      }),
      prisma.notification.create({
        data: {
          userId: order.userId,
          type: NotificationType.PAYMENT_REJECTED,
          title: "Pembayaran dibatalkan",
          message: `Pembayaran untuk "${order.courseTitle}" dibatalkan oleh admin. Kamu bisa melakukan pembelian ulang kapan saja.`,
          refId: orderId,
        },
      }),
    ]);
  } catch (err) {
    console.error("[cancelOrder] failed", err);
    return { ok: false, reason: "error" };
  }

  return { ok: true };
}

/**
 * Soft-delete an order (any status): set `deletedAt` so it drops out of the
 * admin list while the row is retained for audit. Records the audit entry.
 */
export async function softDeleteOrder(
  orderId: string,
  ctx: AdminActionContext,
): Promise<AdminTxnWriteResult> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, deletedAt: null },
    select: { id: true, status: true },
  });
  if (!order) return { ok: false, reason: "not_found" };

  try {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { deletedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId: ctx.actorId,
          action: "ORDER_DELETE",
          entityType: "Order",
          entityId: orderId,
          metadata: { status: order.status },
          ipAddress: ctx.ip,
          userAgent: ctx.ua,
        },
      }),
    ]);
  } catch (err) {
    console.error("[softDeleteOrder] failed", err);
    return { ok: false, reason: "error" };
  }

  return { ok: true };
}
