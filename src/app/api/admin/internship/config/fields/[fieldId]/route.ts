import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteField,
  describeFieldFailure,
  updateField,
} from "@/lib/admin-internship-config-write";
import { fieldUpdateSchema } from "@/lib/validations/admin-internship-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/internship/config/fields/[fieldId] — rename a bidang. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ fieldId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = fieldUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data bidang tidak valid." },
      { status: 400 },
    );
  }

  const { fieldId } = await ctx.params;
  const result = await updateField(fieldId, parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeFieldFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}

/**
 * DELETE /api/admin/internship/config/fields/[fieldId] — delete a bidang.
 * Blocked (409) while it still has any Kelas or Tugas.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ fieldId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { fieldId } = await ctx.params;
  const result = await deleteField(fieldId, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeFieldFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}
