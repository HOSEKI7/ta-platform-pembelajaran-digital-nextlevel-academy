import "server-only";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { CategoryFormInput } from "@/lib/validations/admin-category";

/**
 * Server-side write operations for admin Kategori Course (PRD §6.11.3.1).
 * Centralises create / update / delete + AuditLog so the route handlers stay
 * thin.
 *
 * - Names are unique (`Category.name @unique`) → P2002 surfaces as a friendly
 *   "duplicate" reason instead of a 500.
 * - Delete is **guarded**: a category still used by any course or voucher cannot
 *   be removed (reason "in_use" → HTTP 409). The admin must reassign first.
 */

export type AdminActionContext = {
  actorId: string;
};

export type CategoryWriteFailure =
  | "not_found"
  | "duplicate"
  | "in_use"
  | "error";

export type CategoryWriteResult =
  | { ok: true; id: string }
  | { ok: false; reason: CategoryWriteFailure; courseCount?: number; voucherCount?: number };

function auditData(
  ctx: AdminActionContext,
  action: string,
  categoryId: string,
  metadata: Prisma.InputJsonValue,
) {
  return {
    actorId: ctx.actorId,
    action,
    entityType: "Category",
    entityId: categoryId,
    metadata,
  };
}

/** Duck-typed Prisma unique-constraint check — `instanceof` is unreliable here. */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

type NormalizedCategory = {
  name: string;
  description: string | null;
};

function normalize(input: CategoryFormInput): NormalizedCategory {
  return {
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
  };
}

export async function createCategory(
  input: CategoryFormInput,
  ctx: AdminActionContext,
): Promise<CategoryWriteResult> {
  const data = normalize(input);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data,
        select: { id: true },
      });
      await tx.auditLog.create({
        data: auditData(ctx, "CATEGORY_CREATE", category.id, { name: data.name }),
      });
      return category;
    });
    return { ok: true, id: created.id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[createCategory] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryFormInput,
  ctx: AdminActionContext,
): Promise<CategoryWriteResult> {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const data = normalize(input);

  try {
    await prisma.$transaction([
      prisma.category.update({ where: { id }, data }),
      prisma.auditLog.create({
        data: auditData(ctx, "CATEGORY_UPDATE", id, { name: data.name }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[updateCategory] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function deleteCategory(
  id: string,
  ctx: AdminActionContext,
): Promise<CategoryWriteResult> {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { courses: true, vouchers: true } },
    },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  // Guard: a category still referenced by a course or voucher cannot be removed.
  const { courses, vouchers } = existing._count;
  if (courses > 0 || vouchers > 0) {
    return {
      ok: false,
      reason: "in_use",
      courseCount: courses,
      voucherCount: vouchers,
    };
  }

  try {
    await prisma.$transaction([
      prisma.category.delete({ where: { id } }),
      prisma.auditLog.create({
        data: auditData(ctx, "CATEGORY_DELETE", id, { name: existing.name }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[deleteCategory] failed", err);
    return { ok: false, reason: "error" };
  }
}

export function describeCategoryFailure(result: {
  reason: CategoryWriteFailure;
  courseCount?: number;
  voucherCount?: number;
}): { status: number; error: string } {
  switch (result.reason) {
    case "not_found":
      return { status: 404, error: "Kategori tidak ditemukan." };
    case "duplicate":
      return { status: 409, error: "Nama kategori sudah digunakan." };
    case "in_use": {
      const parts: string[] = [];
      if (result.courseCount) parts.push(`${result.courseCount} kursus`);
      if (result.voucherCount) parts.push(`${result.voucherCount} voucher`);
      const used = parts.join(" dan ");
      return {
        status: 409,
        error: `Kategori masih dipakai ${used}. Pindahkan dulu sebelum menghapus.`,
      };
    }
    case "error":
      return { status: 500, error: "Gagal memproses kategori. Coba lagi." };
  }
}
