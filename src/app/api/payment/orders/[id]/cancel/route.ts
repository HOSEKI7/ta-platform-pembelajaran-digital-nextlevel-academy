import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { cancelMidtransTransaction, isMidtransConfigured } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payment/orders/[id]/cancel
 *
 * Lets a student cancel their own PENDING order (e.g. they picked the wrong
 * payment method) and immediately check out the same course again. Reuses the
 * FAILED status (no new enum) — which also clears the live-PENDING double-
 * purchase guard so a fresh order is allowed. If the order consumed a voucher,
 * the usage is released so it can be reused.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, status: true, paymentInvoiceId: true, voucherId: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Pesanan ini tidak dapat dibatalkan." },
      { status: 409 },
    );
  }

  // Cancel the Snap session first so it can no longer be paid. Best-effort:
  // a Midtrans-side failure (already expired, etc.) must not block the local flip.
  if (isMidtransConfigured() && order.paymentInvoiceId) {
    await cancelMidtransTransaction(order.paymentInvoiceId);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    if (order.voucherId) {
      await tx.voucherUsage.deleteMany({ where: { orderId: order.id } });
      await tx.voucher.update({
        where: { id: order.voucherId },
        data: { usageCount: { decrement: 1 } },
      });
    }
  });

  return NextResponse.json({ data: { status: "FAILED" } }, { status: 200 });
}
