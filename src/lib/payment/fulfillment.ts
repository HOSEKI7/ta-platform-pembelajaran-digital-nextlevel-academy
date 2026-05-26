import "server-only";

import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { env } from "@/lib/env";
import { idr } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

/**
 * Single source of truth for "an order was paid" (PRD §6.4).
 *
 * Called by BOTH the Midtrans webhook and the dev-fallback simulate endpoint so
 * the success path — flip Order → SUCCESS, grant the Enrollment, send the
 * confirmation email — is identical and idempotent.
 *
 * Idempotency:
 *   - If the order is already SUCCESS we return `{ alreadyFulfilled: true }`
 *     without touching anything (satisfies "SUCCESS is immutable" + webhook
 *     retries).
 *   - The Enrollment is upserted on its unique (userId, courseId), so a
 *     re-delivered webhook can't create a duplicate enrollment.
 *
 * The confirmation email is sent AFTER the transaction commits and is wrapped
 * so a mail failure never rolls back the enrollment (course access is the
 * thing that matters).
 */
export type FulfillResult =
  | { ok: true; alreadyFulfilled: boolean }
  | { ok: false; reason: "not_found" };

export async function fulfillOrderPaid(
  orderId: string,
  details: { paymentMethod?: string | null; paidAt?: Date },
): Promise<FulfillResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      courseId: true,
      status: true,
      finalPrice: true,
      paymentInvoiceId: true,
      paymentMethod: true,
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true } },
    },
  });

  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "SUCCESS") return { ok: true, alreadyFulfilled: true };

  const paidAt = details.paidAt ?? new Date();

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "SUCCESS",
        paidAt,
        // Keep the method already chosen at checkout if the gateway didn't send one.
        paymentMethod: details.paymentMethod ?? order.paymentMethod,
      },
    });

    // Grant lifetime access. Upsert keeps this idempotent against retries and
    // against an enrollment created by another path (e.g. admin grant).
    await tx.enrollment.upsert({
      where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
      create: { userId: order.userId, courseId: order.courseId, enrolledAt: paidAt },
      update: {},
    });
  });

  // Fire-and-forget confirmation email. Never let a mail error undo fulfillment.
  try {
    const appUrl = env.appUrl();
    await sendEmail({
      to: order.user.email,
      subject: `Pembayaran berhasil — ${order.course.title}`,
      react: OrderConfirmationEmail({
        name: order.user.name,
        courseTitle: order.course.title,
        learnUrl: `${appUrl}/learn/${order.course.slug}`,
        transactionUrl: `${appUrl}/transactions/${order.id}`,
        invoiceNumber: order.paymentInvoiceId ?? order.id,
        amountLabel: idr.format(order.finalPrice),
      }),
    });
  } catch (err) {
    console.error("[fulfillOrderPaid] confirmation email failed", err);
  }

  return { ok: true, alreadyFulfilled: false };
}
