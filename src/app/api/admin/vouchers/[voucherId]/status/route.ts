import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  describeVoucherFailure,
  setVoucherActive,
} from "@/lib/admin-voucher-write";
import { voucherStatusSchema } from "@/lib/validations/admin-voucher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/vouchers/[voucherId]/status — toggle a voucher active/inactive
 * (deactivate / reactivate, PRD §6.11.6). Records the action in AuditLog.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ voucherId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = voucherStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const { voucherId } = await ctx.params;
  const result = await setVoucherActive(voucherId, parsed.data.isActive, {
    actorId: auth.user.id,
    ip: req.headers.get("x-forwarded-for"),
    ua: req.headers.get("user-agent"),
  });

  if (!result.ok) {
    const { status, error } = describeVoucherFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}
