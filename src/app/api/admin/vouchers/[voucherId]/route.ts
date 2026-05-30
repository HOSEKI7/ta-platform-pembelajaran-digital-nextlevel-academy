import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteVoucher,
  describeVoucherFailure,
  updateVoucher,
} from "@/lib/admin-voucher-write";
import { voucherFormSchema } from "@/lib/validations/admin-voucher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/vouchers/[voucherId] — edit an existing admin voucher
 * (PRD §6.11.6). Unlike create, a past expiry is tolerated so the admin can
 * correct it.
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

  const parsed = voucherFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data voucher tidak valid." },
      { status: 400 },
    );
  }

  const { voucherId } = await ctx.params;
  const result = await updateVoucher(voucherId, parsed.data, {
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

/**
 * DELETE /api/admin/vouchers/[voucherId] — hard-delete (PRD §6.11.6). Blocked
 * (409) when the voucher has been used; the admin is told to deactivate instead.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ voucherId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { voucherId } = await ctx.params;
  const result = await deleteVoucher(voucherId, {
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
