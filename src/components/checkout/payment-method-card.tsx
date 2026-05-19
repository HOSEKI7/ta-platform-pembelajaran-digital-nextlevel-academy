"use client";

import Link from "next/link";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PAYMENT_GROUPS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

type Props = {
  selectedMethod: string | null;
  onMethodChange: (id: string) => void;
  agreedToTerms: boolean;
  onAgreedChange: (agreed: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
};

export function PaymentMethodCard({
  selectedMethod,
  onMethodChange,
  agreedToTerms,
  onAgreedChange,
  onSubmit,
  isSubmitting,
  submitError,
}: Props) {
  const canSubmit = Boolean(selectedMethod) && agreedToTerms && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="payment-method-heading"
      className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_24px_60px_-32px_rgba(35,65,137,0.25)] sm:p-7"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="payment-method-heading"
            className="font-heading text-lg font-extrabold tracking-tight text-zinc-900"
          >
            Pilih Metode Pembayaran
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Semua transaksi dienkripsi end-to-end.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600 ring-1 ring-zinc-200">
          <Lock className="size-3" strokeWidth={2.6} />
          Powered by DOKU
        </span>
      </header>

      <RadioGroup
        value={selectedMethod ?? undefined}
        onValueChange={(value: string) => onMethodChange(value)}
        className="mt-6 grid gap-6"
      >
        {PAYMENT_GROUPS.map((group) => {
          const items = PAYMENT_METHODS.filter((m) => m.group === group.id);
          return (
            <fieldset key={group.id} className="grid gap-2">
              <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {group.label}
              </legend>
              <div className="grid gap-2">
                {items.map((m) => (
                  <PaymentMethodRow
                    key={m.id}
                    method={m}
                    selected={selectedMethod === m.id}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}
      </RadioGroup>

      <div className="mt-7 border-t border-zinc-200 pt-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={(checked) => onAgreedChange(checked === true)}
            className="mt-0.5"
          />
          <span className="leading-snug">
            Saya menyetujui{" "}
            <Link
              href="#"
              className="font-semibold text-[color:var(--color-brand-700)] underline underline-offset-4 hover:text-[color:var(--color-brand-900)]"
            >
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="#"
              className="font-semibold text-[color:var(--color-brand-700)] underline underline-offset-4 hover:text-[color:var(--color-brand-900)]"
            >
              Kebijakan Tanpa Refund
            </Link>
            .
          </span>
        </label>
      </div>

      {submitError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-[color:var(--color-error)]/8 px-3.5 py-2.5 text-xs font-medium text-[color:var(--color-error)] ring-1 ring-[color:var(--color-error)]/20"
        >
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "group mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition",
          "bg-[color:var(--color-brand-500)] shadow-[0_18px_36px_-16px_rgba(71,142,244,0.8)] hover:bg-[color:var(--color-brand-600)]",
          "disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Memproses pesanan...
          </>
        ) : (
          <>
            <Lock className="size-4" strokeWidth={2.4} />
            Bayar Sekarang
          </>
        )}
      </button>

      <p className="mt-4 inline-flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-500">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[color:var(--color-success)]" />
        Transaksi diproses langsung oleh DOKU dengan enkripsi standar PCI-DSS.
        Data kartu kamu tidak pernah disimpan di server NextLevel Academy.
      </p>
    </form>
  );
}

function PaymentMethodRow({
  method,
  selected,
}: {
  method: PaymentMethod;
  selected: boolean;
}) {
  return (
    <label
      htmlFor={`pm-${method.id}`}
      className={cn(
        "group/row flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 transition",
        selected
          ? "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)]/40 ring-2 ring-[color:var(--color-brand-200)]"
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-12 shrink-0 place-items-center rounded-lg text-[10px] font-extrabold tracking-tight ring-1 transition",
          selected
            ? "bg-white text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-300)]"
            : "bg-zinc-50 text-zinc-600 ring-zinc-200",
        )}
      >
        {method.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-900">
          {method.label}
        </span>
        {method.hint ? (
          <span className="block truncate text-[11px] text-zinc-500">
            {method.hint}
          </span>
        ) : null}
      </span>
      <RadioGroupItem id={`pm-${method.id}`} value={method.id} />
    </label>
  );
}
