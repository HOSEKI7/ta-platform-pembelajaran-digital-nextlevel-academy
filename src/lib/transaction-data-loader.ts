import "server-only";

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
  /** Order id — shown verbatim as the "ID Transaksi". */
  id: string;
  courseTitle: string;
  /** ISO string — `Order.createdAt` (the moment checkout was created). */
  checkoutAt: string;
  status: TransactionStatus;
  /** Final amount paid/charged in IDR (whole rupiah). */
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
 * Loads the student's transaction history for the "Transaksi" page.
 *
 * Returns every `Order` the user owns regardless of status — PRD §6.4.4
 * requires the full history (including `FAILED`/`EXPIRED`) to stay visible.
 * Sorted by `createdAt` (checkout time) and paginated; `total` drives the
 * toolbar range and pagination footer.
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
        paymentInvoiceId: true,
        course: { select: { title: true } },
      },
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reconcile PENDING rows against Midtrans (or lazily expire) so the table
  // reflects payments/expiries the webhook may have missed. Terminal rows are
  // left untouched; pending orders are few, and a per-row failure is isolated.
  const statuses = await Promise.all(
    rows.map(async (r) => {
      if (r.status !== "PENDING") return r.status;
      try {
        return await reconcileOrder({
          id: r.id,
          status: r.status,
          paymentInvoiceId: r.paymentInvoiceId,
          finalPrice: r.finalPrice,
          expiresAt: r.expiresAt,
        });
      } catch {
        return r.status;
      }
    }),
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

  // Reconcile against Midtrans (or lazily expire) so the detail reflects a
  // payment/expiry the webhook may have missed. On a real transition, re-read
  // the now-stale status-derived fields (paidAt/paymentMethod).
  let status = order.status;
  let paidAt = order.paidAt;
  let paymentMethod = order.paymentMethod;
  if (order.status === "PENDING") {
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
      thumbnailUrl: order.course.thumbnailUrl,
      instructor: order.course.instructor,
      categoryName: order.course.category.name,
    },
  };
}
