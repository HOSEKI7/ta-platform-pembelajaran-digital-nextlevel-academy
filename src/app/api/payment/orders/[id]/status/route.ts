import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { reconcileOrder } from "@/lib/payment/reconcile";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payment/orders/[id]/status
 *
 * Lightweight, owner-scoped order status used by the checkout/transaction pages
 * to poll for updates. Reconciles a PENDING order against Midtrans (or lazily
 * expires it) so polling reflects the real status even when the webhook never
 * reached us. Returns `{ status, expiresAt }`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      paymentInvoiceId: true,
      finalPrice: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const status =
    order.status === "PENDING" ? await reconcileOrder(order) : order.status;

  return NextResponse.json(
    { data: { status, expiresAt: order.expiresAt.toISOString() } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
