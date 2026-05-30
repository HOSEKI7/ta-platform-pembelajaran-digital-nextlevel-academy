/**
 * Shared types + query-key factory + URL parsers for the admin Voucher
 * Management surface at `/admin/vouchers`. Safe to import from both Server
 * Components and Client Components — keep this file free of any Prisma /
 * server-only imports.
 *
 * The data layer (Prisma queries) lives in `./admin-vouchers-loader.ts`.
 */

import type { VoucherDiscountType } from "@/generated/prisma";

export const PAGE_SIZE = 10;

/** Status dropdown values — "all" is the unfiltered default. */
export const STATUS_FILTERS = [
  "all",
  "scheduled",
  "active",
  "inactive",
  "expired",
  "exhausted",
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/**
 * Derived voucher status shown as a badge. Mirrors the filter values minus
 * "all". Precedence (in `deriveVoucherStatus`): inactive → scheduled →
 * expired → exhausted → active.
 */
export type VoucherDerivedStatus =
  | "scheduled"
  | "active"
  | "inactive"
  | "expired"
  | "exhausted";

/** Sort options — by usage count or by valid-until (endDate). */
export const SORT_OPTIONS = [
  "usage_desc",
  "usage_asc",
  "valid_desc",
  "valid_asc",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type AdminVouchersParams = {
  page: number;
  status: StatusFilter;
  sort: SortOption;
  search: string;
};

export type AdminVoucherRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: VoucherDiscountType;
  discountPct: number;
  discountAmount: number | null;
  usageCount: number;
  /** null = tak terbatas. */
  maxUsage: number | null;
  /** ISO strings — formatted DD/MM/YYYY WIB on the client. */
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: VoucherDerivedStatus;
};

export type AdminVouchersResult = {
  rows: AdminVoucherRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Full voucher record used to seed the Edit form. */
export type AdminVoucherDetail = {
  id: string;
  code: string;
  description: string | null;
  discountType: VoucherDiscountType;
  discountPct: number;
  discountAmount: number | null;
  maxUsage: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: VoucherDerivedStatus;
};

export function adminVouchersKey(params: AdminVouchersParams) {
  return ["admin", "vouchers", params] as const;
}

export function parseStatus(value: string | null | undefined): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

export function parseSort(value: string | null | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "valid_desc";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
