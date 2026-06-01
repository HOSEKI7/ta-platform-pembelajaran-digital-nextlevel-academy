import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { createField, describeFieldFailure } from "@/lib/admin-internship-config-write";
import { fieldCreateSchema } from "@/lib/validations/admin-internship-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/internship/config/fields — create a bidang under a batch. */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = fieldCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data bidang tidak valid." },
      { status: 400 },
    );
  }

  const result = await createField(parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeFieldFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
