import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { acceptOrder, describeWriteFailure } from "@/lib/admin-transaction-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/transactions/[orderId]/accept — admin manually confirms a
 * PENDING payment (PRD §6.11.5). Runs the canonical fulfillment path: SUCCESS +
 * Enrollment + confirmation email, then audits the action and notifies the
 * student.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { orderId } = await ctx.params;
  const result = await acceptOrder(orderId, {
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
