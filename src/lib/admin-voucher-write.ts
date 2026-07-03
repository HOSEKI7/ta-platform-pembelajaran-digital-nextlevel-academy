import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import type { VoucherFormInput } from "@/lib/validations/admin-voucher";

/**
 * Admin-side write operations for the Voucher Management surface (PRD §6.11.6).
 * Each helper guards the voucher state, performs the mutation, and records the
 * action in `AuditLog`. The route handlers map the discriminated result to the
 * right HTTP status via `describeVoucherFailure`.
 */

export type AdminActionContext = {
  actorId: string;
  ip: string | null;
  ua: string | null;
};

export type VoucherWriteFailure =
  | "not_found"
  | "code_taken"
  | "in_use"
  | "inconsistent_category"
  | "max_one_per_user_conflict"
  | "error";

export type VoucherCreateResult =
  | { ok: true; id: string }
  | { ok: false; reason: VoucherWriteFailure };

export type VoucherWriteResult =
  | { ok: true }
  | { ok: false; reason: VoucherWriteFailure };

/** Maps a write-failure reason to its HTTP status + user-facing message. */
export function describeVoucherFailure(reason: VoucherWriteFailure): {
  status: number;
  error: string;
} {
  switch (reason) {
    case "not_found":
      return { status: 404, error: "Voucher tidak ditemukan." };
    case "code_taken":
      return { status: 409, error: "Kode voucher sudah dipakai." };
    case "in_use":
      return {
        status: 409,
        error: "Voucher sudah pernah dipakai dan tidak bisa dihapus. Nonaktifkan saja.",
      };
    case "inconsistent_category":
      return {
        status: 409,
        error: "Kursus yang dipilih tidak termasuk dalam kategori yang ditentukan.",
      };
    case "max_one_per_user_conflict":
      return {
        status: 400,
        error: "Voucher dengan batas 1 kali per pengguna tidak bisa dikombinasikan dengan kursus tertentu.",
      };
    case "error":
      return { status: 500, error: "Gagal memproses voucher. Coba lagi." };
  }
}

/**
 * Server-side safety net: if both allowedCourseId and allowedCategoryId are set,
 * verify the course actually belongs to that category. Also reject
 * maxOneUsePerUser + allowedCourseId (inconsistent).
 */
async function validateScopeConsistency(
  input: VoucherFormInput,
): Promise<VoucherWriteFailure | null> {
  if (input.maxOneUsePerUser && input.allowedCourseId) {
    return "max_one_per_user_conflict";
  }
  if (input.allowedCourseId && input.allowedCategoryId) {
    const course = await prisma.course.findUnique({
      where: { id: input.allowedCourseId },
      select: { categoryId: true },
    });
    if (course && course.categoryId !== input.allowedCategoryId) {
      return "inconsistent_category";
    }
  }
  return null;
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

/**
 * Maps validated form input to the persisted column shape. PERCENTAGE stores
 * `discountPct` (discountAmount null); FIXED stores `discountAmount` (discountPct
 * 0, unused). Empty `startDate` → now() (aktif seketika).
 */
function toVoucherData(input: VoucherFormInput): {
  discountType: VoucherFormInput["discountType"];
  discountPct: number;
  discountAmount: number | null;
  description: string | null;
  maxUsage: number | null;
  startDate: Date;
  endDate: Date;
  allowedCourseId: string | null;
  allowedCategoryId: string | null;
  maxUsagePerUser: number | null;
} {
  const isPct = input.discountType === "PERCENTAGE";
  return {
    discountType: input.discountType,
    discountPct: isPct ? input.discountPct : 0,
    discountAmount: isPct ? null : input.discountAmount,
    description: input.description.trim() || null,
    maxUsage: input.maxUsage,
    startDate: input.startDate ? new Date(input.startDate) : new Date(),
    endDate: new Date(input.endDate),
    allowedCourseId: input.allowedCourseId ?? null,
    allowedCategoryId: input.allowedCategoryId ?? null,
    maxUsagePerUser: input.maxOneUsePerUser ? 1 : null,
  };
}

function auditData(
  ctx: AdminActionContext,
  action: string,
  voucherId: string,
  metadata: Prisma.InputJsonValue,
) {
  return {
    actorId: ctx.actorId,
    action,
    entityType: "Voucher",
    entityId: voucherId,
    metadata,
    ipAddress: ctx.ip,
    userAgent: ctx.ua,
  };
}

export async function createVoucher(
  input: VoucherFormInput,
  ctx: AdminActionContext,
): Promise<VoucherCreateResult> {
  const consistency = await validateScopeConsistency(input);
  if (consistency) return { ok: false, reason: consistency };

  const data = toVoucherData(input);
  try {
    const voucher = await prisma.$transaction(async (tx) => {
      const created = await tx.voucher.create({
        data: { code: input.code, isSystemGenerated: false, ...data },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: auditData(ctx, "VOUCHER_CREATE", created.id, {
          code: input.code,
          discountType: data.discountType,
          allowedCourseId: data.allowedCourseId,
          allowedCategoryId: data.allowedCategoryId,
          maxUsagePerUser: data.maxUsagePerUser,
        }),
      });
      return created;
    });
    return { ok: true, id: voucher.id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "code_taken" };
    console.error("[createVoucher] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function updateVoucher(
  id: string,
  input: VoucherFormInput,
  ctx: AdminActionContext,
): Promise<VoucherWriteResult> {
  const consistency = await validateScopeConsistency(input);
  if (consistency) return { ok: false, reason: consistency };

  const existing = await prisma.voucher.findFirst({
    where: { id, isSystemGenerated: false },
    select: { id: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const data = toVoucherData(input);
  try {
    await prisma.$transaction([
      prisma.voucher.update({
        where: { id },
        data: { code: input.code, ...data },
      }),
      prisma.auditLog.create({
        data: auditData(ctx, "VOUCHER_UPDATE", id, {
          code: input.code,
          discountType: data.discountType,
          allowedCourseId: data.allowedCourseId,
          allowedCategoryId: data.allowedCategoryId,
          maxUsagePerUser: data.maxUsagePerUser,
        }),
      }),
    ]);
    return { ok: true };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "code_taken" };
    console.error("[updateVoucher] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function setVoucherActive(
  id: string,
  isActive: boolean,
  ctx: AdminActionContext,
): Promise<VoucherWriteResult> {
  const existing = await prisma.voucher.findFirst({
    where: { id, isSystemGenerated: false },
    select: { id: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  try {
    await prisma.$transaction([
      prisma.voucher.update({ where: { id }, data: { isActive } }),
      prisma.auditLog.create({
        data: auditData(
          ctx,
          isActive ? "VOUCHER_ACTIVATE" : "VOUCHER_DEACTIVATE",
          id,
          { isActive },
        ),
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[setVoucherActive] failed", err);
    return { ok: false, reason: "error" };
  }
}

/**
 * Hard-delete a voucher. Blocked (409) when it has been used — any
 * `VoucherUsage` or `Order` reference protects the FK and the transaction
 * history. The admin is steered toward deactivation instead.
 */
export async function deleteVoucher(
  id: string,
  ctx: AdminActionContext,
): Promise<VoucherWriteResult> {
  const existing = await prisma.voucher.findFirst({
    where: { id, isSystemGenerated: false },
    select: { id: true, code: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const [usageCount, orderCount] = await Promise.all([
    prisma.voucherUsage.count({ where: { voucherId: id } }),
    prisma.order.count({ where: { voucherId: id } }),
  ]);
  if (usageCount > 0 || orderCount > 0) return { ok: false, reason: "in_use" };

  try {
    await prisma.$transaction([
      prisma.voucher.delete({ where: { id } }),
      prisma.auditLog.create({
        data: auditData(ctx, "VOUCHER_DELETE", id, { code: existing.code }),
      }),
    ]);
    return { ok: true };
  } catch (err) {
    console.error("[deleteVoucher] failed", err);
    return { ok: false, reason: "error" };
  }
}
