import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment/orders/[id]/status
 *
 * Lightweight, owner-scoped order status used by the payment page to poll for
 * webhook-driven updates. Returns `{ status, expiresAt }`.
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
    select: { status: true, expiresAt: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(
    { data: { status: order.status, expiresAt: order.expiresAt.toISOString() } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
