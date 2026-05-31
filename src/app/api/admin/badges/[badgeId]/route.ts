import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteBadge,
  describeBadgeFailure,
  updateBadge,
} from "@/lib/admin-badge-write";
import { badgeFormSchema } from "@/lib/validations/admin-badge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/badges/[badgeId] — edit a badge (PRD §6.11.8). The trigger is
 * immutable; `updateBadge` ignores any incoming trigger.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ badgeId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = badgeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data badge tidak valid." },
      { status: 400 },
    );
  }

  const { badgeId } = await ctx.params;
  const result = await updateBadge(badgeId, parsed.data, {
    actorId: auth.user.id,
  });

  if (!result.ok) {
    const { status, error } = describeBadgeFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}

/** DELETE /api/admin/badges/[badgeId] — hard-delete (earned history preserved). */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ badgeId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { badgeId } = await ctx.params;
  const result = await deleteBadge(badgeId, { actorId: auth.user.id });

  if (!result.ok) {
    const { status, error } = describeBadgeFailure(result.reason);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}
