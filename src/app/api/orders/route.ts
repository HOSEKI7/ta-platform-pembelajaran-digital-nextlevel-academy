import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { validateVoucher } from "@/lib/checkout-data-loader";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validators/checkout";

export const dynamic = "force-dynamic";

const ORDER_EXPIRY_MS = 60 * 60 * 1000; // PRD §6.4 — 60 minutes

/**
 * POST /api/orders
 *
 * Creates a PENDING `Order` row representing the student's intent to buy a
 * course. **Does not call DOKU yet** — gateway integration is a follow-up
 * task. Once DOKU is wired up, this handler will additionally:
 *   - Call DOKU's charge endpoint with the order details
 *   - Populate `paymentInvoiceId` from DOKU's response
 *   - Return a `redirectUrl` so the client can hand control to DOKU
 *
 * Today it just persists the order and returns `{ orderId, expiresAt }`.
 *
 * Body: `{ courseId, paymentMethod, voucherCode?, agreedToTerms }`
 */
export async function POST(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

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
      select: { id: true, categoryId: true, price: true, status: true },
    });
    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    // Ownership guard
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

    // Live-pending guard — if a PENDING order still exists, return it
    // instead of creating a duplicate. Front-end can pick this up to
    // resume the existing flow.
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
      return NextResponse.json(
        {
          error: "Kamu sudah punya pesanan aktif untuk kursus ini.",
          data: { orderId: livePending.id, expiresAt: livePending.expiresAt },
        },
        { status: 409 },
      );
    }

    // Re-run voucher validation server-side (never trust the client's
    // discount calculation). If the code is stale by now we surface the
    // error here.
    let appliedVoucherId: string | null = null;
    let discountAmount = 0;
    if (voucherCode) {
      const voucherResult = await validateVoucher({
        code: voucherCode,
        userId,
        course: {
          id: course.id,
          categoryId: course.categoryId,
          price: course.price,
        },
      });
      if (!voucherResult.ok) {
        return NextResponse.json({ error: voucherResult.error }, { status: 400 });
      }
      appliedVoucherId = voucherResult.voucher.id;
      discountAmount = voucherResult.discountAmount;
    }

    const finalPrice = Math.max(0, course.price - discountAmount);
    const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MS);

    // Atomic: create Order + (optionally) VoucherUsage + bump usageCount.
    // If any step throws the whole transaction rolls back — prevents a
    // voucher from being "spent" without a backing order, and vice versa.
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          courseId: course.id,
          voucherId: appliedVoucherId,
          originalPrice: course.price,
          discountAmount,
          finalPrice,
          status: "PENDING",
          paymentMethod,
          expiresAt,
        },
        select: { id: true, expiresAt: true },
      });

      if (appliedVoucherId) {
        await tx.voucherUsage.create({
          data: {
            voucherId: appliedVoucherId,
            userId,
            orderId: created.id,
          },
        });
        await tx.voucher.update({
          where: { id: appliedVoucherId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return created;
    });

    // TODO(payment): trigger DOKU charge here, save invoiceId, return
    // redirectUrl. For now the client just shows a success toast and the
    // order sits PENDING until expiry (60 min).
    return NextResponse.json(
      { data: { orderId: order.id, expiresAt: order.expiresAt } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "Gagal membuat pesanan." },
      { status: 500 },
    );
  }
}
