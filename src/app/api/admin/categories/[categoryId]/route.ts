import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  deleteCategory,
  describeCategoryFailure,
  updateCategory,
} from "@/lib/admin-category-write";
import { categoryFormSchema } from "@/lib/validations/admin-category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/admin/categories/[categoryId] — edit a category (PRD §6.11.3.1). */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ categoryId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = categoryFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." },
      { status: 400 },
    );
  }

  const { categoryId } = await ctx.params;
  const result = await updateCategory(categoryId, parsed.data, {
    actorId: auth.user.id,
  });

  if (!result.ok) {
    const { status, error } = describeCategoryFailure(result);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}

/**
 * DELETE /api/admin/categories/[categoryId] — delete a category. Blocked with
 * 409 when still used by any course or voucher (PRD §6.11.3.1).
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ categoryId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { categoryId } = await ctx.params;
  const result = await deleteCategory(categoryId, { actorId: auth.user.id });

  if (!result.ok) {
    const { status, error } = describeCategoryFailure(result);
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data: { ok: true } });
}
