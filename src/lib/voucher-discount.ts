import type { VoucherDiscountType } from "@/generated/prisma";

import { idr } from "@/lib/format";

/**
 * Voucher discount math + label, shared by the admin Voucher Management surface,
 * the checkout voucher validator, and any UI that shows a discount.
 *
 * Kept client-safe (pure, no `server-only` / Prisma) so both Server Components
 * and Client Components can import it. The discount is resolved from
 * `discountType`:
 *  - `PERCENTAGE` → `floor(price * discountPct / 100)`
 *  - `FIXED`      → `min(discountAmount, price)` (never discounts below 0)
 */
export type VoucherDiscountShape = {
  discountType: VoucherDiscountType;
  discountPct: number;
  discountAmount: number | null;
};

/** Rupiah value to subtract from `price` for this voucher. Always ≥ 0. */
export function computeVoucherDiscount(
  v: VoucherDiscountShape,
  price: number,
): number {
  if (v.discountType === "FIXED") {
    return Math.min(Math.max(0, v.discountAmount ?? 0), price);
  }
  return Math.floor((price * v.discountPct) / 100);
}

/** Compact label for tables/breakdowns: `"20%"` or `"Rp50.000"`. */
export function formatVoucherDiscount(v: VoucherDiscountShape): string {
  if (v.discountType === "FIXED") {
    return idr.format(v.discountAmount ?? 0);
  }
  return `${v.discountPct}%`;
}
