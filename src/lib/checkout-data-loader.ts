import "server-only";

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
  | { status: "ok"; course: CheckoutCourse }
  | { status: "owned" }
  | { status: "pending"; orderId: string }
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
  const pending = await prisma.order.findFirst({
    where: {
      userId,
      courseId: course.id,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
  if (pending) return { status: "pending", orderId: pending.id };

  return {
    status: "ok",
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnailUrl: course.thumbnailUrl,
      shortDescription: course.shortDescription,
      price: course.price,
      fakePrice: course.fakePrice,
      estimatedDuration: course.estimatedDuration,
      instructor: course.instructor,
      category: { id: course.category.id, name: course.category.name },
    },
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
 *  4. Per-user cap (maxUsagePerUser) not exhausted — looks at VoucherUsage
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
  | "user_cap"
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

  const userUses = await prisma.voucherUsage.count({
    where: { voucherId: voucher.id, userId },
  });
  if (userUses >= voucher.maxUsagePerUser) {
    return {
      ok: false,
      code: "user_cap",
      error: "Kamu sudah menggunakan voucher ini.",
    };
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
