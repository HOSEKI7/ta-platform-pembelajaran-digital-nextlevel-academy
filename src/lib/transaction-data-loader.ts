import "server-only";

import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { reconcileOrder } from "@/lib/payment/reconcile";
import { prisma } from "@/lib/prisma";
import type {
  TransactionsPageSize,
  TransactionsSort,
} from "@/lib/validators/transactions";

/** Mirrors the Prisma `OrderStatus` enum (PRD §6.4.4). */
export type TransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "CANCELED";

export type TransactionRowDTO = {
  id: string;
  courseTitle: string;
  checkoutAt: string;
  status: TransactionStatus;
  finalPrice: number;
};

export type TransactionsPageDTO = {
  rows: TransactionRowDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type TransactionsFilters = {
  sort: TransactionsSort;
  pageSize: TransactionsPageSize;
  page: number;
};

/**
 * Loads the student's transaction history.
 *
 * PENDING status is derived via lazy local expiry only — real reconciliation
 * runs in the cron (every 5 min) and when the user opens the detail page.
 * The webhook is the primary success path.
 */
export async function loadTransactionRows(
  userId: string,
  filters: TransactionsFilters,
): Promise<TransactionsPageDTO> {
  const { sort, pageSize, page } = filters;

  const [total, rows] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        finalPrice: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        course: { select: { title: true } },
      },
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const now = Date.now();
  const statuses = rows.map((r) =>
    r.status === "PENDING" && r.expiresAt.getTime() < now ? "EXPIRED" as const : r.status,
  );

  return {
    rows: rows.map((r, i) => ({
      id: r.id,
      courseTitle: r.course.title,
      checkoutAt: r.createdAt.toISOString(),
      status: statuses[i],
      finalPrice: r.finalPrice,
    })),
    pagination: { page, pageSize, total, totalPages },
  };
}

export type TransactionDetailDTO = {
  id: string;
  status: TransactionStatus;
  /** ISO — `Order.createdAt`. */
  checkoutAt: string;
  /** ISO — `Order.paidAt`, null until the gateway confirms. */
  paidAt: string | null;
  /** ISO — `Order.expiresAt` (60-min checkout window). */
  expiresAt: string;
  paymentMethod: string | null;
  paymentInvoiceId: string | null;
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
};

/**
 * Loads one order for the `/transactions/[id]` detail page. **Scoped by
 * `userId`** — an order belonging to another user resolves to `null` (the
 * page renders a 404), so ids can't be enumerated across accounts.
 */
export async function loadTransactionDetail(
  userId: string,
  orderId: string,
): Promise<TransactionDetailDTO | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      paidAt: true,
      expiresAt: true,
      paymentMethod: true,
      paymentInvoiceId: true,
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

  let status = order.status;
  let paidAt = order.paidAt;
  let paymentMethod = order.paymentMethod;
  if (order.status === "PENDING") {
    try {
      const reconciled = await reconcileOrder({
        id: order.id,
        status: order.status,
        paymentInvoiceId: order.paymentInvoiceId,
        finalPrice: order.finalPrice,
        expiresAt: order.expiresAt,
      });
      if (reconciled !== order.status) {
        const fresh = await prisma.order.findUnique({
          where: { id: order.id },
          select: { status: true, paidAt: true, paymentMethod: true },
        });
        status = fresh?.status ?? reconciled;
        paidAt = fresh?.paidAt ?? null;
        paymentMethod = fresh?.paymentMethod ?? order.paymentMethod;
      }
    } catch {
      // Midtrans unreachable — render with current DB status; cron catches up.
    }
  }

  return {
    id: order.id,
    status,
    checkoutAt: order.createdAt.toISOString(),
    paidAt: paidAt ? paidAt.toISOString() : null,
    expiresAt: order.expiresAt.toISOString(),
    paymentMethod,
    paymentInvoiceId: order.paymentInvoiceId,
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
      thumbnailUrl: resolveCourseImageUrl(order.course.thumbnailUrl),
      instructor: order.course.instructor,
      categoryName: order.course.category.name,
    },
  };
}
