import "server-only";

import { NotificationType } from "@/generated/prisma";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { env } from "@/lib/env";
import { idr } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export type FulfillResult =
  | { ok: true; alreadyFulfilled: boolean }
  | { ok: false; reason: "not_found" };

export async function fulfillOrderPaid(
  orderId: string,
  details: { paymentMethod?: string | null; paidAt?: Date },
  opts?: { suppressPurchaseNotification?: boolean },
): Promise<FulfillResult> {
  const paidAt = details.paidAt ?? new Date();

  type Snap = {
    user: { name: string; email: string };
    course: { title: string; slug: string };
    paymentInvoiceId: string | null;
    finalPrice: number;
  };
  type TxResult =
    | { ok: false; reason: "not_found" }
    | { ok: true; alreadyFulfilled: true }
    | { ok: true; alreadyFulfilled: false; snap: Snap };

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
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

    if (!order) return { ok: false, reason: "not_found" } as TxResult;
    if (order.status === "SUCCESS") return { ok: true, alreadyFulfilled: true } as TxResult;

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "SUCCESS",
        paidAt,
        paymentMethod: details.paymentMethod ?? order.paymentMethod,
      },
    });

    await tx.enrollment.upsert({
      where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
      create: { userId: order.userId, courseId: order.courseId, enrolledAt: paidAt },
      update: {},
    });

    if (!opts?.suppressPurchaseNotification) {
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: NotificationType.PURCHASE_SUCCESS,
          title: "Selamat, course berhasil dimiliki!",
          message: `Pembelian "${order.course.title}" berhasil. Akses kamu berlaku selamanya — yuk mulai belajar sekarang!`,
          refId: order.id,
        },
      });
    }

    return {
      ok: true, alreadyFulfilled: false,
      snap: {
        user: order.user,
        course: order.course,
        paymentInvoiceId: order.paymentInvoiceId,
        finalPrice: order.finalPrice,
      },
    } as TxResult;
  });

  if (!result.ok) return { ok: false, reason: "not_found" };
  if (result.alreadyFulfilled) return { ok: true, alreadyFulfilled: true };

  const { snap } = result;

  try {
    const appUrl = env.appUrl();
    await sendEmail({
      to: snap.user.email,
      subject: `Pembayaran berhasil — ${snap.course.title}`,
      react: OrderConfirmationEmail({
        name: snap.user.name,
        courseTitle: snap.course.title,
        learnUrl: `${appUrl}/learn/${snap.course.slug}`,
        transactionUrl: `${appUrl}/transactions/${orderId}`,
        invoiceNumber: snap.paymentInvoiceId ?? orderId,
        amountLabel: idr.format(snap.finalPrice),
      }),
    });
  } catch (err) {
    console.error("[fulfillOrderPaid] confirmation email failed", err);
  }

  return { ok: true, alreadyFulfilled: false };
}
