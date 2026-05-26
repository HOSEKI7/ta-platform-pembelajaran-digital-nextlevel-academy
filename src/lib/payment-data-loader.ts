import "server-only";

import { prisma } from "@/lib/prisma";
import type { TransactionStatus } from "@/lib/transaction-data-loader";

/**
 * Data for the branded payment page (`/payment/[orderId]`).
 *
 * Scoped by `userId` so an order belonging to someone else resolves to `null`
 * (the page renders a 404), keeping ids non-enumerable across accounts.
 */
export type PaymentPageData = {
  id: string;
  status: TransactionStatus;
  /** Human-readable invoice number (== Midtrans order_id). May be null for free/legacy orders. */
  invoiceNumber: string | null;
  /** ISO — 60-minute checkout deadline. */
  expiresAt: string;
  /** True when a PENDING order has already passed its deadline (cron may not have run yet). */
  isExpired: boolean;
  paymentMethod: string | null;
  pricing: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  };
  voucher: { code: string; discountPct: number } | null;
  course: {
    title: string;
    slug: string;
    thumbnailUrl: string;
    instructor: string;
    categoryName: string;
  };
  /** Snap artefacts — present when Midtrans is configured. */
  paymentToken: string | null;
  paymentRedirectUrl: string | null;
};

export async function loadPaymentPageData(
  userId: string,
  orderId: string,
): Promise<PaymentPageData | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      paymentMethod: true,
      paymentInvoiceId: true,
      paymentToken: true,
      paymentRedirectUrl: true,
      originalPrice: true,
      discountAmount: true,
      finalPrice: true,
      voucher: { select: { code: true, discountPct: true } },
      course: {
        select: {
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    status: order.status,
    invoiceNumber: order.paymentInvoiceId,
    expiresAt: order.expiresAt.toISOString(),
    isExpired: order.status === "PENDING" && order.expiresAt.getTime() < Date.now(),
    paymentMethod: order.paymentMethod,
    pricing: {
      originalPrice: order.originalPrice,
      discountAmount: order.discountAmount,
      finalPrice: order.finalPrice,
    },
    voucher: order.voucher
      ? { code: order.voucher.code, discountPct: order.voucher.discountPct }
      : null,
    course: {
      title: order.course.title,
      slug: order.course.slug,
      thumbnailUrl: order.course.thumbnailUrl,
      instructor: order.course.instructor,
      categoryName: order.course.category.name,
    },
    paymentToken: order.paymentToken,
    paymentRedirectUrl: order.paymentRedirectUrl,
  };
}
