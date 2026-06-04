import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { cancelPendingOrder, describeCancelFailure } from "@/lib/payment/cancel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/orders/[orderId]/cancel — the student cancels their own PENDING
 * payment (PRD §6.4). Flips the order to CANCELED (no enrollment, no charge) so
 * they can checkout again immediately instead of waiting out the 60-min expiry.
 * Owner-scoped: another user's order resolves to 404.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (auth instanceof Response) return auth;

  const { orderId } = await ctx.params;
  const result = await cancelPendingOrder({
    orderId,
    userId: auth.user.id,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    const { status, error } = describeCancelFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}
