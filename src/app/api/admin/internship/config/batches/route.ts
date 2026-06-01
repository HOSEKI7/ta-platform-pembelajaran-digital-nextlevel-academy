import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { createBatch, describeBatchFailure } from "@/lib/admin-internship-config-write";
import { batchFormSchema } from "@/lib/validations/admin-internship-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/internship/config/batches — create a batch. */
export async function POST(req: Request) {
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

  const result = await createBatch(parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeBatchFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
