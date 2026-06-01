import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { createClass, describeClassFailure } from "@/lib/admin-internship-config-write";
import { classCreateSchema } from "@/lib/validations/admin-internship-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/internship/config/classes — create a kelas. The class letter
 * (A, B, …) is server-assigned (next free letter within the field).
 */
export async function POST(req: Request) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = classCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data kelas tidak valid." },
      { status: 400 },
    );
  }

  const result = await createClass(parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeClassFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { id: result.id } }, { status: 201 });
}
