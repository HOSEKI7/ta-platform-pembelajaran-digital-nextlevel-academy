import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteBatch,
  describeBatchFailure,
  updateBatch,
} from "@/lib/admin-internship-config-write";
import { batchFormSchema } from "@/lib/validations/admin-internship-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/internship/config/batches/[batchId] — edit a batch. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ batchId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = batchFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data batch tidak valid." },
      { status: 400 },
    );
  }

  const { batchId } = await ctx.params;
  const result = await updateBatch(batchId, parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeBatchFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}

/**
 * DELETE /api/admin/internship/config/batches/[batchId] — delete a batch.
 * Blocked (409) while it still has any Bidang or Tugas.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ batchId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { batchId } = await ctx.params;
  const result = await deleteBatch(batchId, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeBatchFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}
