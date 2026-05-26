import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { isMidtransConfigured } from "@/lib/midtrans";
import { fulfillOrderPaid } from "@/lib/payment/fulfillment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({ orderId: z.string().min(1) });

/**
 * POST /api/payment/dev-simulate — dev-only payment simulation.
 *
 * Active ONLY when Midtrans is not configured AND we're not in production. With
 * real keys present, or in production, it 404s — there is no way to mark an
 * order paid without the gateway. Owner-scoped; reuses the same fulfillment
 * path as the webhook.
 */
export async function POST(request: NextRequest) {
  if (isMidtransConfigured() || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  // Ownership + still-pending check before fulfilling.
  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: session.user.id },
    select: { id: true, status: true, expiresAt: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Pesanan tidak dalam status menunggu pembayaran." },
      { status: 409 },
    );
  }
  if (order.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Pesanan sudah kedaluwarsa." }, { status: 409 });
  }

  await fulfillOrderPaid(order.id, { paidAt: new Date() });

  return NextResponse.json({ data: { orderId: order.id, status: "SUCCESS" } });
}
