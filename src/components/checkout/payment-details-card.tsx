"use client";

import { Receipt } from "lucide-react";

import type { AppliedVoucher } from "@/hooks/use-checkout";

import { PriceBreakdown } from "./price-breakdown";
import { PromoCodeInput } from "./promo-code-input";

type Props = {
  originalPrice: number;
  appliedVoucher: AppliedVoucher | null;
  voucherError: string | null;
  isApplying: boolean;
  onApplyVoucher: (code: string) => void;
  onClearVoucher: () => void;
};

export function PaymentDetailsCard({
  originalPrice,
  appliedVoucher,
  voucherError,
  isApplying,
  onApplyVoucher,
  onClearVoucher,
}: Props) {
  return (
    <section
      aria-labelledby="payment-details-heading"
      className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_20px_50px_-30px_rgba(35,65,137,0.18)] sm:p-7"
    >
      <header className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]">
          <Receipt className="size-4" strokeWidth={2.2} />
        </span>
        <h2
          id="payment-details-heading"
          className="font-heading text-lg font-extrabold tracking-tight text-zinc-900"
        >
          Detail Pembayaran
        </h2>
      </header>

      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Kode Promo
          </p>
          <PromoCodeInput
            applied={appliedVoucher}
            isLoading={isApplying}
            error={voucherError}
            onApply={onApplyVoucher}
            onClear={onClearVoucher}
          />
        </div>

        <div className="border-t border-zinc-200 pt-5">
          <PriceBreakdown
            originalPrice={originalPrice}
            discountAmount={appliedVoucher?.discountAmount ?? 0}
            voucherCode={appliedVoucher?.code ?? null}
          />
        </div>
      </div>
    </section>
  );
}
