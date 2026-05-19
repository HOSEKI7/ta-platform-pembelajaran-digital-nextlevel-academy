import { Tag } from "lucide-react";

import { idr } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  originalPrice: number;
  discountAmount: number;
  voucherCode?: string | null;
  className?: string;
};

export function PriceBreakdown({
  originalPrice,
  discountAmount,
  voucherCode,
  className,
}: Props) {
  const total = Math.max(0, originalPrice - discountAmount);
  const hasDiscount = discountAmount > 0;

  return (
    <dl className={cn("space-y-3 text-sm", className)}>
      <div className="flex items-center justify-between">
        <dt className="text-zinc-600">Subtotal</dt>
        <dd className="font-medium tabular-nums text-zinc-900">
          {idr.format(originalPrice)}
        </dd>
      </div>

      {/* Reserve the row even when no discount, so the total below doesn't
          jump when a voucher is applied — keeps layout stable. */}
      <div
        className={cn(
          "flex items-center justify-between transition-opacity",
          hasDiscount ? "opacity-100" : "opacity-0 select-none",
        )}
        aria-hidden={!hasDiscount}
      >
        <dt className="inline-flex items-center gap-1.5 text-[color:var(--color-success)]">
          <Tag className="size-3.5" strokeWidth={2.4} />
          Diskon{voucherCode ? ` (${voucherCode})` : ""}
        </dt>
        <dd className="font-semibold tabular-nums text-[color:var(--color-success)]">
          −{idr.format(discountAmount)}
        </dd>
      </div>

      <div className="mt-1 border-t border-zinc-200 pt-3">
        <div className="flex items-end justify-between gap-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Total Pembayaran
          </dt>
          <dd className="font-heading text-2xl font-extrabold tabular-nums text-[color:var(--color-brand-700)]">
            {idr.format(total)}
          </dd>
        </div>
      </div>
    </dl>
  );
}
