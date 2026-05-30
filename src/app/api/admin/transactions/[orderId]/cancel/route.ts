import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { cancelOrder, describeWriteFailure } from "@/lib/admin-transaction-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/transactions/[orderId]/cancel — admin cancels a PENDING
 * payment (PRD §6.11.5): mark it FAILED, audit the action, notify the student.
 * No enrollment is granted.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { orderId } = await ctx.params;
  const result = await cancelOrder(orderId, {
    actorId: auth.user.id,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    const { status, error } = describeWriteFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}
