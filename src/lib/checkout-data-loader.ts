import "server-only";

import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";
import type { VoucherDiscountType } from "@/generated/prisma";
import { computeVoucherDiscount } from "@/lib/voucher-discount";

/**
 * Server-side data assembly for the checkout page (`/checkout/[slug]`).
 *
 * Returns one of:
 *  - `{ status: "ok", course }` — render the checkout form
 *  - `{ status: "owned" }` — student already has an Enrollment for this course
 *  - `{ status: "pending", orderId }` — student already has a live PENDING
 *    order (within 60-min expiry window). UI should let them resume it.
 *  - `{ status: "not-found" }` — slug doesn't match any PUBLISHED course
 *
 * The caller (Server Component) decides how to react: render, redirect, or
 * notFound(). Centralizing the decision here keeps the page small and makes
 * unit testing the rules straightforward later.
 */
export type CheckoutPageData =
  | { status: "ok"; course: CheckoutCourse; lastPhone: string | null }
  | { status: "owned" }
  | { status: "pending"; course: CheckoutCourse; resume: ResumeOrder }
  | { status: "not-found" };

export type CheckoutCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  shortDescription: string | null;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  instructor: string;
  category: { id: string; name: string };
};

/** Data needed to resume a live PENDING order (reopen the Snap popup). */
export type ResumeOrder = {
  orderId: string;
  /** Stored Snap token to reopen `snap.pay(token)`. Null in the dev fallback. */
  paymentToken: string | null;
  /** ISO — 60-minute checkout deadline. */
  expiresAt: string;
  invoiceNumber: string | null;
  pricing: { originalPrice: number; discountAmount: number; finalPrice: number };
  voucher: { code: string; discountPct: number } | null;
};

function toCheckoutCourse(course: {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  shortDescription: string | null;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  instructor: string;
  category: { id: string; name: string };
}): CheckoutCourse {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    thumbnailUrl: resolveCourseImageUrl(course.thumbnailUrl),
    shortDescription: course.shortDescription,
    price: course.price,
    fakePrice: course.fakePrice,
    estimatedDuration: course.estimatedDuration,
    instructor: course.instructor,
    category: { id: course.category.id, name: course.category.name },
  };
}

export async function loadCheckoutPageData(
  userId: string,
  slug: string,
): Promise<CheckoutPageData> {
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!course) return { status: "not-found" };

  // Ownership guard — student already enrolled means a previous order
  // succeeded (or admin granted access). No point re-charging.
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: course.id },
    select: { id: true },
  });
  if (enrollment) return { status: "owned" };

  // Live-pending guard — block double-charge per CLAUDE.md. We only treat
  // an order as "live" if it's still within the 60-min expiry window;
  // expired orders are ignored and the student can start a fresh checkout.
  // Resume reopens the Snap popup with the stored token (no new order).
  const pending = await prisma.order.findFirst({
    where: {
      userId,
      courseId: course.id,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      paymentToken: true,
      expiresAt: true,
      paymentInvoiceId: true,
      originalPrice: true,
      discountAmount: true,
      finalPrice: true,
      voucher: { select: { code: true, discountPct: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  if (pending) {
    return {
      status: "pending",
      course: toCheckoutCourse(course),
      resume: {
        orderId: pending.id,
        paymentToken: pending.paymentToken,
        expiresAt: pending.expiresAt.toISOString(),
        invoiceNumber: pending.paymentInvoiceId,
        pricing: {
          originalPrice: pending.originalPrice,
          discountAmount: pending.discountAmount,
          finalPrice: pending.finalPrice,
        },
        voucher: pending.voucher
          ? { code: pending.voucher.code, discountPct: pending.voucher.discountPct }
          : null,
      },
    };
  }

  // Prefill the phone field from the user's most recent order that has one —
  // a small convenience that also seeds data for the planned WhatsApp feature.
  const lastWithPhone = await prisma.order.findFirst({
    where: { userId, customerPhone: { not: null } },
    select: { customerPhone: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    status: "ok",
    course: toCheckoutCourse(course),
    lastPhone: lastWithPhone?.customerPhone ?? null,
  };
}

/**
 * Shared voucher validation used by both `POST /api/vouchers/validate` and
 * `POST /api/orders`. Single source of truth so the two endpoints can't
 * disagree on what "valid" means.
 *
 * Validates in this order (so the first failing rule's error is the one the
 * user sees):
 *  1. Code exists and is active
 *  2. Within startDate/endDate
 *  3. Global cap (maxUsage) not exhausted
 *  4. Per-user state-machine lock (maxUsagePerUser):
 *     PENDING → locked, SUCCESS → permanent, FAILED/etc → released
 *  5. allowedUser scope matches (or null)
 *  6. allowedCourse scope matches (or null)
 *  7. allowedCategory scope matches the course's category (or null)
 */
export type VoucherValidationOk = {
  ok: true;
  voucher: {
    id: string;
    code: string;
    discountType: VoucherDiscountType;
    discountPct: number;
    description: string | null;
  };
  discountAmount: number;
  finalPrice: number;
};
export type VoucherValidationErr = { ok: false; error: string; code: VoucherErrorCode };
export type VoucherErrorCode =
  | "not_found"
  | "inactive"
  | "out_of_window"
  | "global_cap"
  | "max_use_locked"
  | "max_use_exhausted"
  | "wrong_user"
  | "wrong_course"
  | "wrong_category";

export async function validateVoucher(args: {
  code: string;
  userId: string;
  course: { id: string; categoryId: string; price: number };
}): Promise<VoucherValidationOk | VoucherValidationErr> {
  const { code, userId, course } = args;

  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher) {
    return { ok: false, code: "not_found", error: "Kode promo tidak ditemukan." };
  }
  if (!voucher.isActive) {
    return { ok: false, code: "inactive", error: "Voucher tidak aktif." };
  }

  const now = new Date();
  if (now < voucher.startDate || now > voucher.endDate) {
    return {
      ok: false,
      code: "out_of_window",
      error: "Voucher tidak berlaku pada periode ini.",
    };
  }

  if (voucher.maxUsage != null && voucher.usageCount >= voucher.maxUsage) {
    return {
      ok: false,
      code: "global_cap",
      error: "Voucher telah mencapai batas pemakaian.",
    };
  }

  // Per-user state-machine lock (PRD §6.8):
  // PENDING  → lock (order in progress)
  // SUCCESS  → permanent lock (already used)
  // FAILED | EXPIRED | CANCELED → released (can retry)
  if (voucher.maxUsagePerUser != null) {
    const usages = await prisma.voucherUsage.findMany({
      where: { voucherId: voucher.id, userId },
      include: { order: { select: { status: true } } },
    });
    for (const u of usages) {
      if (u.order.status === "PENDING") {
        return {
          ok: false,
          code: "max_use_locked",
          error: "Kamu sudah memiliki pesanan aktif dengan voucher ini.",
        };
      }
      if (u.order.status === "SUCCESS") {
        return {
          ok: false,
          code: "max_use_exhausted",
          error: "Kamu sudah menggunakan voucher ini.",
        };
      }
      // FAILED | EXPIRED | CANCELED → released
    }
  }

  if (voucher.allowedUserId && voucher.allowedUserId !== userId) {
    return {
      ok: false,
      code: "wrong_user",
      error: "Voucher ini tidak tersedia untuk akunmu.",
    };
  }

  if (voucher.allowedCourseId && voucher.allowedCourseId !== course.id) {
    return {
      ok: false,
      code: "wrong_course",
      error: "Voucher tidak berlaku untuk kursus ini.",
    };
  }

  if (
    voucher.allowedCategoryId &&
    voucher.allowedCategoryId !== course.categoryId
  ) {
    return {
      ok: false,
      code: "wrong_category",
      error: "Voucher tidak berlaku untuk kategori kursus ini.",
    };
  }

  const discountAmount = computeVoucherDiscount(voucher, course.price);
  const finalPrice = Math.max(0, course.price - discountAmount);

  return {
    ok: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountPct: voucher.discountPct,
      description: voucher.description,
    },
    discountAmount,
    finalPrice,
  };
}
