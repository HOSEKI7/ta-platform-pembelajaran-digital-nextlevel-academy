import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteClass,
  describeClassFailure,
  updateClass,
} from "@/lib/admin-internship-config-write";
import { classUpdateSchema } from "@/lib/validations/admin-internship-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/internship/config/classes/[classId] — edit class capacity. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ classId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = classUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data kelas tidak valid." },
      { status: 400 },
    );
  }

  const { classId } = await ctx.params;
  const result = await updateClass(classId, parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeClassFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}

/**
 * DELETE /api/admin/internship/config/classes/[classId] — delete a kelas.
 * Blocked (409) while it still has peserta, mentor, or tugas.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ classId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { classId } = await ctx.params;
  const result = await deleteClass(classId, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeClassFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}
