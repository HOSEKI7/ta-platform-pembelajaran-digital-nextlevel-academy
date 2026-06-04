import "server-only";

import { prisma } from "@/lib/prisma";
import { Role, type Prisma } from "@/generated/prisma";
import type {
  TransactionDetailDTO,
  TransactionStatus,
} from "@/lib/transaction-data-loader";

import {
  PAGE_SIZE,
  type AdminTransactionDetail,
  type AdminTransactionsParams,
  type AdminTransactionsResult,
  type TransactionLogEntry,
} from "./admin-transactions-query";

/**
 * Loads one page of the admin Transaction Management table.
 *
 * Performance shape:
 * - 2 parallel queries (count + findMany) for the page slice.
 * - User name/email and course title come from nested `select`s on the same
 *   findMany — no per-row follow-up query (anti-N+1).
 *
 * Scope:
 * - Soft-deleted orders (`deletedAt`) are excluded (admin removed them).
 * - Only orders owned by Peserta Didik are shown — they are the only role that
 *   purchases courses, and the spec asks for that history specifically.
 * - Every status is included (PENDING/SUCCESS/FAILED/EXPIRED), filtered only
 *   when `status` is set.
 */
export async function loadAdminTransactionsPage(
  params: AdminTransactionsParams,
): Promise<AdminTransactionsResult> {
  const { page, status, sort, search } = params;

  const trimmed = search.trim();
  const where: Prisma.OrderWhereInput = {
    deletedAt: null,
    user: { role: Role.PESERTA_DIDIK },
    ...(status !== "all" ? { status } : {}),
    ...(trimmed
      ? {
          OR: [
            { id: { contains: trimmed, mode: "insensitive" } },
            { user: { name: { contains: trimmed, mode: "insensitive" } } },
            { user: { email: { contains: trimmed, mode: "insensitive" } } },
            { course: { title: { contains: trimmed, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      select: {
        id: true,
        finalPrice: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: sort === "date_asc" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      userName: r.user.name,
      userEmail: r.user.email,
      courseTitle: r.course.title,
      finalPrice: r.finalPrice,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

const ADMIN_ACTION_META: Record<string, string> = {
  ORDER_ACCEPT: "Pembayaran diterima admin",
  ORDER_CANCEL: "Pembayaran dibatalkan admin",
  ORDER_CANCEL_SELF: "Pembayaran dibatalkan peserta",
  ORDER_DELETE: "Transaksi dihapus admin",
};

type AuditMetadata = { oldStatus?: string; newStatus?: string };

function readStatusChange(metadata: Prisma.JsonValue | null): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const m = metadata as AuditMetadata;
  if (m.oldStatus && m.newStatus) return `Status ${m.oldStatus} → ${m.newStatus}`;
  return null;
}

/**
 * Builds the Detail page timeline: order-lifecycle events derived from the
 * order's own timestamps, merged with the admin actions recorded in `AuditLog`,
 * sorted newest-first.
 */
function buildTransactionLog(
  order: {
    id: string;
    status: TransactionStatus;
    createdAt: Date;
    paidAt: Date | null;
    expiresAt: Date;
    paymentMethod: string | null;
  },
  audits: {
    id: string;
    action: string;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    actor: { name: string } | null;
  }[],
): TransactionLogEntry[] {
  const entries: TransactionLogEntry[] = [];

  // Lifecycle: order created.
  entries.push({
    id: `lifecycle-created-${order.id}`,
    kind: "lifecycle",
    label: "Pesanan dibuat",
    detail: "Menunggu pembayaran",
    actorName: null,
    at: order.createdAt.toISOString(),
  });

  // Lifecycle: payment settled.
  if (order.paidAt) {
    entries.push({
      id: `lifecycle-paid-${order.id}`,
      kind: "lifecycle",
      label: "Pembayaran berhasil",
      detail: order.paymentMethod ? `Metode ${order.paymentMethod}` : null,
      actorName: null,
      at: order.paidAt.toISOString(),
    });
  }

  // Lifecycle: order expired (only meaningful when it actually expired).
  if (order.status === "EXPIRED") {
    entries.push({
      id: `lifecycle-expired-${order.id}`,
      kind: "lifecycle",
      label: "Pesanan kedaluwarsa",
      detail: "Melewati batas waktu pembayaran",
      actorName: null,
      at: order.expiresAt.toISOString(),
    });
  }

  // Admin actions from the audit log.
  for (const a of audits) {
    entries.push({
      id: a.id,
      kind: "admin",
      label: ADMIN_ACTION_META[a.action] ?? a.action,
      detail: readStatusChange(a.metadata),
      actorName: a.actor?.name ?? null,
      at: a.createdAt.toISOString(),
    });
  }

  return entries.sort((x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : 0));
}

/**
 * Loads one order for the admin `/admin/transactions/[orderId]` detail page.
 *
 * Unlike the Peserta-Didik loader this is **not** scoped to a userId (admins see
 * every order), but it still excludes soft-deleted rows. Returns the same
 * `TransactionDetailDTO` shape the invoice card already consumes, plus the
 * customer identity and the merged transaction log.
 */
export async function loadAdminTransactionDetail(
  orderId: string,
): Promise<AdminTransactionDetail | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, deletedAt: null },
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
      user: { select: { name: true, email: true } },
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

  const audits = await prisma.auditLog.findMany({
    where: { entityType: "Order", entityId: orderId },
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
      actor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tx: TransactionDetailDTO = {
    id: order.id,
    status: order.status,
    checkoutAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    expiresAt: order.expiresAt.toISOString(),
    paymentMethod: order.paymentMethod,
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

  return {
    tx,
    customer: { name: order.user.name, email: order.user.email },
    log: buildTransactionLog(
      {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        expiresAt: order.expiresAt,
        paymentMethod: order.paymentMethod,
      },
      audits,
    ),
  };
}
