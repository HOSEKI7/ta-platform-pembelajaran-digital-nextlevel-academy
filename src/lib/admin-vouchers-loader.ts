import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

import {
  PAGE_SIZE,
  type AdminVoucherDetail,
  type AdminVouchersParams,
  type AdminVouchersResult,
  type SortOption,
  type StatusFilter,
  type VoucherDerivedStatus,
} from "./admin-vouchers-query";

/**
 * Loads the admin Voucher Management surface (PRD §6.11.6).
 *
 * Scope: only admin-created vouchers (`isSystemGenerated = false`). The
 * gamification reward vouchers (`NLA-LV…`) are owned by the EXP engine and are
 * hidden here per the product decision.
 *
 * Performance: 2 parallel queries (count + findMany) using the `usageCount`
 * column directly (no `_count` follow-ups). The derived-status filter is
 * pushed into the `where` clause so pagination stays correct.
 */

/** Pure status derivation, mirrored exactly by the filter where-clauses below. */
export function deriveVoucherStatus(
  v: {
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    maxUsage: number | null;
    usageCount: number;
  },
  now: Date,
): VoucherDerivedStatus {
  if (!v.isActive) return "inactive";
  if (v.startDate > now) return "scheduled";
  if (v.endDate < now) return "expired";
  if (v.maxUsage != null && v.usageCount >= v.maxUsage) return "exhausted";
  return "active";
}

/**
 * Builds the date/active part of the where clause for a derived status. The
 * usageCount-vs-maxUsage comparison (column-vs-column, unsupported by Prisma's
 * `where`) is resolved separately via `capFilteredIds`.
 */
function statusDateWhere(
  status: Exclude<StatusFilter, "all">,
  now: Date,
): Prisma.VoucherWhereInput {
  switch (status) {
    case "inactive":
      return { isActive: false };
    case "scheduled":
      return { isActive: true, startDate: { gt: now } };
    case "expired":
      return { isActive: true, startDate: { lte: now }, endDate: { lt: now } };
    case "active":
    case "exhausted":
      return {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      };
  }
}

/**
 * Resolves the column-vs-column cap predicate via raw SQL, returning candidate
 * voucher ids. Only needed for the `active` / `exhausted` filters.
 *  - active    → maxUsage IS NULL OR usageCount < maxUsage (still has room)
 *  - exhausted → maxUsage IS NOT NULL AND usageCount >= maxUsage
 */
async function capFilteredIds(kind: "active" | "exhausted"): Promise<string[]> {
  const rows =
    kind === "exhausted"
      ? await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "voucher"
          WHERE "isSystemGenerated" = false
            AND "maxUsage" IS NOT NULL
            AND "usageCount" >= "maxUsage"`
      : await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "voucher"
          WHERE "isSystemGenerated" = false
            AND ("maxUsage" IS NULL OR "usageCount" < "maxUsage")`;
  return rows.map((r) => r.id);
}

function orderByFor(sort: SortOption): Prisma.VoucherOrderByWithRelationInput {
  switch (sort) {
    case "usage_desc":
      return { usageCount: "desc" };
    case "usage_asc":
      return { usageCount: "asc" };
    case "valid_asc":
      return { endDate: "asc" };
    case "valid_desc":
    default:
      return { endDate: "desc" };
  }
}

export async function loadAdminVouchersPage(
  params: AdminVouchersParams,
): Promise<AdminVouchersResult> {
  const { page, status, sort, search } = params;
  const now = new Date();

  const trimmed = search.trim();
  const where: Prisma.VoucherWhereInput = {
    isSystemGenerated: false,
    ...(trimmed ? { code: { contains: trimmed, mode: "insensitive" } } : {}),
  };

  if (status !== "all") {
    Object.assign(where, statusDateWhere(status, now));
    if (status === "active" || status === "exhausted") {
      where.id = { in: await capFilteredIds(status) };
    }
  }

  const [total, rows] = await Promise.all([
    prisma.voucher.count({ where }),
    prisma.voucher.findMany({
      where,
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountPct: true,
        discountAmount: true,
        usageCount: true,
        maxUsage: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
      orderBy: orderByFor(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: rows.map((v) => ({
      id: v.id,
      code: v.code,
      description: v.description,
      discountType: v.discountType,
      discountPct: v.discountPct,
      discountAmount: v.discountAmount,
      usageCount: v.usageCount,
      maxUsage: v.maxUsage,
      startDate: v.startDate.toISOString(),
      endDate: v.endDate.toISOString(),
      isActive: v.isActive,
      status: deriveVoucherStatus(v, now),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * Loads one admin voucher for the Edit form. Returns null when not found or
 * when it is a system-generated reward voucher (not editable here).
 */
export async function loadAdminVoucherFormOptions() {
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, title: true, categoryId: true, status: true },
      orderBy: { title: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { courses, categories };
}

export async function loadAdminVoucherForEdit(
  id: string,
): Promise<AdminVoucherDetail | null> {
  const v = await prisma.voucher.findFirst({
    where: { id, isSystemGenerated: false },
    select: {
      id: true,
      code: true,
      description: true,
      discountType: true,
      discountPct: true,
      discountAmount: true,
      maxUsage: true,
      usageCount: true,
      startDate: true,
      endDate: true,
      isActive: true,
      allowedCourseId: true,
      allowedCategoryId: true,
      maxUsagePerUser: true,
    },
  });
  if (!v) return null;

  return {
    id: v.id,
    code: v.code,
    description: v.description,
    discountType: v.discountType,
    discountPct: v.discountPct,
    discountAmount: v.discountAmount,
    maxUsage: v.maxUsage,
    usageCount: v.usageCount,
    startDate: v.startDate.toISOString(),
    endDate: v.endDate.toISOString(),
    isActive: v.isActive,
    status: deriveVoucherStatus(v, new Date()),
    allowedCourseId: v.allowedCourseId,
    allowedCategoryId: v.allowedCategoryId,
    maxUsagePerUser: v.maxUsagePerUser,
  };
}
