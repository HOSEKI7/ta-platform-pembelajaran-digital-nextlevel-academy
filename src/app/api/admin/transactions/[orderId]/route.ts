import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  describeWriteFailure,
  softDeleteOrder,
} from "@/lib/admin-transaction-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/transactions/[orderId] — soft-delete (PRD §6.11.5). Sets
 * `deletedAt` so the order drops out of the admin list while the row is kept for
 * audit. Any status may be removed. Records the audit entry.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { orderId } = await ctx.params;
  const result = await softDeleteOrder(orderId, {
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
