import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { validateVoucher } from "@/lib/checkout-data-loader";
import { env } from "@/lib/env";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import {
  createSnapTransaction,
  isMidtransConfigured,
  mapPaymentMethodToSnap,
} from "@/lib/midtrans";
import { fulfillOrderPaid } from "@/lib/payment/fulfillment";
import { prisma } from "@/lib/prisma";
import {
  consumeRateLimit,
  orderRateLimiter,
  tooManyRequestsResponse,
} from "@/lib/rate-limit";
import { createOrderSchema } from "@/lib/validators/checkout";

export const dynamic = "force-dynamic";

const ORDER_EXPIRY_MIN = 60; // PRD §6.4 — 60 minutes
const ORDER_EXPIRY_MS = ORDER_EXPIRY_MIN * 60 * 1000;

/**
 * POST /api/orders
 *
 * Creates the student's order and starts the Midtrans Snap payment session
 * (PRD §6.4). All money is recomputed server-side — the client's numbers are
 * never trusted. Double-purchase is blocked at the backend (existing
 * Enrollment OR a live PENDING order).
 *
 * Returns `{ orderId, expiresAt, simulated, status }`:
 *   - `simulated: false` → Snap session created; client navigates to
 *     `/payment/:orderId` which reads the stored token and opens snap.pay().
 *   - `simulated: true`  → Midtrans not configured (dev). The order is PENDING;
 *     the payment page exposes a "simulate payment" button.
 *   - `status: "SUCCESS"` → free order (100% voucher) fulfilled instantly; the
 *     client goes straight to the course.
 */
export async function POST(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  // Rate limit before doing any work — order creation triggers external side
  // effects (Midtrans Snap, confirmation email). Fails open on infra errors.
  const limit = await consumeRateLimit(orderRateLimiter, session.user.id);
  if (!limit.allowed) return tooManyRequestsResponse(limit.retryAfterSec);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const { courseId, paymentMethod, voucherCode } = parsed.data;

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true, categoryId: true, price: true, status: true },
    });
    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    // ---- Double-purchase guards (PRD §6.4.5) -------------------------------
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: course.id },
      select: { id: true },
    });
    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Kamu sudah memiliki kursus ini." },
        { status: 409 },
      );
    }

    const livePending = await prisma.order.findFirst({
      where: {
        userId,
        courseId: course.id,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true, expiresAt: true },
      orderBy: { createdAt: "desc" },
    });
    if (livePending) {
      // Resume the existing session instead of double-charging.
      return NextResponse.json(
        {
          error: "Kamu sudah punya pesanan aktif untuk kursus ini.",
          data: { orderId: livePending.id, expiresAt: livePending.expiresAt },
        },
        { status: 409 },
      );
    }

    // ---- Re-validate voucher server-side ----------------------------------
    let appliedVoucherId: string | null = null;
    let discountAmount = 0;
    if (voucherCode) {
      const voucherResult = await validateVoucher({
        code: voucherCode,
        userId,
        course: { id: course.id, categoryId: course.categoryId, price: course.price },
      });
      if (!voucherResult.ok) {
        return NextResponse.json({ error: voucherResult.error }, { status: 400 });
      }
      appliedVoucherId = voucherResult.voucher.id;
      discountAmount = voucherResult.discountAmount;
    }

    const finalPrice = Math.max(0, course.price - discountAmount);
    const invoiceNumber = generateInvoiceNumber();
    const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MS);

    // ---- Free order (100% voucher) — fulfill instantly, no gateway --------
    if (finalPrice === 0) {
      const result = await createOrderTx({
        userId,
        course,
        appliedVoucherId,
        discountAmount,
        finalPrice,
        invoiceNumber,
        paymentMethod,
        expiresAt,
      });
      if (!result.ok) return conflictResponse(result);
      await fulfillOrderPaid(result.order.id, { paymentMethod, paidAt: new Date() });
      return NextResponse.json(
        { data: { orderId: result.order.id, status: "SUCCESS", slug: course.slug } },
        { status: 201 },
      );
    }

    // ---- Paid order with Midtrans configured ------------------------------
    if (isMidtransConfigured()) {
      // Snap first: if it fails we persist nothing (no consumed voucher).
      let snap: { token: string; redirectUrl: string };
      try {
        snap = await createSnapTransaction({
          orderId: invoiceNumber,
          grossAmount: finalPrice,
          itemId: course.id,
          itemName: course.title,
          customer: { name: session.user.name, email: session.user.email },
          enabledPayments: mapPaymentMethodToSnap(paymentMethod) ?? undefined,
          finishUrl: `${env.appUrl()}/transactions`,
          expiryMinutes: ORDER_EXPIRY_MIN,
        });
      } catch (err) {
        console.error("[POST /api/orders] Snap createTransaction failed", err);
        return NextResponse.json(
          { error: "Gagal memulai sesi pembayaran. Coba lagi." },
          { status: 502 },
        );
      }

      const result = await createOrderTx({
        userId,
        course,
        appliedVoucherId,
        discountAmount,
        finalPrice,
        invoiceNumber,
        paymentMethod,
        expiresAt,
        paymentToken: snap.token,
        paymentRedirectUrl: snap.redirectUrl,
      });
      // A racing request won — the orphaned Snap transaction just expires.
      if (!result.ok) return conflictResponse(result);

      return NextResponse.json(
        { data: { orderId: result.order.id, expiresAt: result.order.expiresAt, simulated: false } },
        { status: 201 },
      );
    }

    // ---- Dev fallback: no gateway — PENDING order, simulate on payment page
    const result = await createOrderTx({
      userId,
      course,
      appliedVoucherId,
      discountAmount,
      finalPrice,
      invoiceNumber,
      paymentMethod,
      expiresAt,
    });
    if (!result.ok) return conflictResponse(result);
    return NextResponse.json(
      { data: { orderId: result.order.id, expiresAt: result.order.expiresAt, simulated: true } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Gagal membuat pesanan." }, { status: 500 });
  }
}

type CreateOrderTxResult =
  | { ok: true; order: { id: string; expiresAt: Date } }
  | { ok: false; conflict: "enrolled" | "pending"; orderId?: string };

/**
 * Atomically creates the Order plus (when a voucher applies) its VoucherUsage
 * and a usageCount bump. Rolling back together prevents a voucher being "spent"
 * without a backing order, and vice versa.
 *
 * Hardening against the double-PENDING / double-charge race: a Postgres
 * transaction advisory lock keyed on (userId, courseId) serializes concurrent
 * create-order requests for the same pair (works across serverless instances,
 * unlike the in-memory pre-checks). The enrollment + live-PENDING guards are
 * re-checked **inside** the lock so a racing request can't slip a second order
 * past the pre-checks. A partial unique index isn't used because Prisma can't
 * declare one and `prisma db push` would drop a hand-rolled index.
 */
async function createOrderTx(args: {
  userId: string;
  course: { id: string; price: number };
  appliedVoucherId: string | null;
  discountAmount: number;
  finalPrice: number;
  invoiceNumber: string;
  paymentMethod: string;
  expiresAt: Date;
  paymentToken?: string;
  paymentRedirectUrl?: string;
}): Promise<CreateOrderTxResult> {
  return prisma.$transaction(async (tx) => {
    // $executeRaw (not $queryRaw): pg_advisory_xact_lock returns `void`, which
    // the pg driver adapter can't serialize as a result column — executeRaw
    // runs the statement without serializing a result, so the lock is taken
    // cleanly. Auto-released on commit/rollback.
    const lockKey = `order:${args.userId}:${args.course.id}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::int8)`;

    // Re-check guards under the lock — closes the TOCTOU window left by the
    // fast pre-checks in the handler.
    const enrolled = await tx.enrollment.findFirst({
      where: { userId: args.userId, courseId: args.course.id },
      select: { id: true },
    });
    if (enrolled) return { ok: false, conflict: "enrolled" };

    const pending = await tx.order.findFirst({
      where: {
        userId: args.userId,
        courseId: args.course.id,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    if (pending) return { ok: false, conflict: "pending", orderId: pending.id };

    const created = await tx.order.create({
      data: {
        userId: args.userId,
        courseId: args.course.id,
        voucherId: args.appliedVoucherId,
        originalPrice: args.course.price,
        discountAmount: args.discountAmount,
        finalPrice: args.finalPrice,
        status: "PENDING",
        paymentInvoiceId: args.invoiceNumber,
        paymentMethod: args.paymentMethod,
        paymentToken: args.paymentToken ?? null,
        paymentRedirectUrl: args.paymentRedirectUrl ?? null,
        expiresAt: args.expiresAt,
      },
      select: { id: true, expiresAt: true },
    });

    if (args.appliedVoucherId) {
      await tx.voucherUsage.create({
        data: { voucherId: args.appliedVoucherId, userId: args.userId, orderId: created.id },
      });
      await tx.voucher.update({
        where: { id: args.appliedVoucherId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return { ok: true, order: created };
  });
}

/** Maps a createOrderTx conflict to the matching 409 response. */
function conflictResponse(
  result: Extract<CreateOrderTxResult, { ok: false }>,
): NextResponse {
  if (result.conflict === "enrolled") {
    return NextResponse.json({ error: "Kamu sudah memiliki kursus ini." }, { status: 409 });
  }
  return NextResponse.json(
    {
      error: "Kamu sudah punya pesanan aktif untuk kursus ini.",
      data: { orderId: result.orderId },
    },
    { status: 409 },
  );
}
