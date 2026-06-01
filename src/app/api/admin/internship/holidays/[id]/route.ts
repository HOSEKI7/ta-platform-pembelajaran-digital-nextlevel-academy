import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteHoliday,
  describeHolidayFailure,
  updateHoliday,
} from "@/lib/admin-internship-holiday-write";
import { holidayUpdateSchema } from "@/lib/validations/admin-internship-holiday";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/internship/holidays/[id] — edit (UPCOMING) or end-early
 * (ACTIVE) a holiday. The state machine is enforced server-side; the `mode`
 * discriminator must match the row's actual lifecycle state.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = holidayUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data libur tidak valid." },
      { status: 400 },
    );
  }

  const { id } = await ctx.params;
  const result = await updateHoliday(id, parsed.data, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeHolidayFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}

/**
 * DELETE /api/admin/internship/holidays/[id] — delete a holiday.
 * Allowed only while the holiday is still UPCOMING (active/past are locked).
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const result = await deleteHoliday(id, { actorId: auth.user.id });
  if (!result.ok) {
    const { status, error } = describeHolidayFailure(result);
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ data: { ok: true } });
}
