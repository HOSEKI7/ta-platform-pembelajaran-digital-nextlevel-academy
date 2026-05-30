"use client";

import { useState } from "react";
import { Loader2, Sparkles, Tag, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatVoucherDiscount } from "@/lib/voucher-discount";
import type { AppliedVoucher } from "@/hooks/use-checkout";

type Props = {
  applied: AppliedVoucher | null;
  isLoading: boolean;
  error: string | null;
  onApply: (code: string) => void;
  onClear: () => void;
};

export function PromoCodeInput({
  applied,
  isLoading,
  error,
  onApply,
  onClear,
}: Props) {
  const [value, setValue] = useState("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim();
    if (!code || isLoading || applied) return;
    onApply(code);
  };

  // Applied state: render the green success chip with a clear button. The
  // input itself is hidden — the student must remove the current promo to
  // try another one.
  if (applied) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[color:var(--color-success)]/8 px-4 py-3 ring-1 ring-[color:var(--color-success)]/25"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]">
            <Sparkles className="size-4" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-success)]">
              Promo {applied.code} aktif
            </p>
            <p className="text-xs text-zinc-600">
              Hemat {formatVoucherDiscount(applied)}
              {applied.description ? ` — ${applied.description}` : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setValue("");
            onClear();
          }}
          aria-label="Hapus promo"
          className="inline-flex size-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-400)]"
        >
          <X className="size-4" strokeWidth={2.4} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-1.5">
      <div
        className={cn(
          "group flex h-12 items-center rounded-2xl border bg-white pr-1.5 transition focus-within:border-[color:var(--color-brand-400)] focus-within:ring-2 focus-within:ring-[color:var(--color-brand-400)]/30",
          error
            ? "border-[color:var(--color-error)]/50 focus-within:border-[color:var(--color-error)] focus-within:ring-[color:var(--color-error)]/25"
            : "border-zinc-200",
        )}
      >
        <span className="grid size-12 place-items-center text-zinc-400">
          <Tag className="size-4" strokeWidth={2.2} />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Punya kode promo? Masukkan di sini"
          autoComplete="off"
          spellCheck={false}
          disabled={isLoading}
          aria-label="Kode promo"
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition",
            "bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_18px_-10px_rgba(71,142,244,0.7)] hover:bg-[color:var(--color-brand-600)]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Memeriksa
            </>
          ) : (
            "Terapkan"
          )}
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="pl-1 text-xs font-medium text-[color:var(--color-error)]"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
