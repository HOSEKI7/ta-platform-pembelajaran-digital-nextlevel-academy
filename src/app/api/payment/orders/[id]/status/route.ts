import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payment/orders/[id]/status
 *
 * Returns the order's current status. PENDING is resolved via lazy local
 * expiry only — real reconciliation runs in the cron (every 5 min) and on
 * the transaction detail page. The webhook is the primary success path;
 * polling status is purely a UI hint so the detail page auto-refreshes.
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
    select: { id: true, status: true, expiresAt: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const status =
    order.status === "PENDING" && order.expiresAt.getTime() < Date.now()
      ? "EXPIRED"
      : order.status;

  return NextResponse.json(
    { data: { status, expiresAt: order.expiresAt.toISOString() } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
