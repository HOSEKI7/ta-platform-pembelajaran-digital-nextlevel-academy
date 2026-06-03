"use client";

import { UserRound } from "lucide-react";

import { PhoneField } from "./phone-field";

type Props = {
  name: string;
  email: string;
  initialPhone?: string | null;
  onPhoneChange: (value: string) => void;
  phoneError?: string | null;
};

/**
 * Buyer information for checkout. Email and name are locked (from the session);
 * the phone is optional (stored as E.164 for a planned post-checkout WhatsApp
 * notification). Payment method is no longer collected here — it's chosen inside
 * the Snap popup.
 */
export function BuyerInfoCard({
  name,
  email,
  initialPhone,
  onPhoneChange,
  phoneError,
}: Props) {
  return (
    <section
      aria-labelledby="buyer-info-heading"
      className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 shadow-[0_20px_50px_-30px_rgba(35,65,137,0.18)] sm:p-7"
    >
      <header className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]">
          <UserRound className="size-4" strokeWidth={2.2} />
        </span>
        <h2
          id="buyer-info-heading"
          className="font-heading text-lg font-extrabold tracking-tight text-zinc-900"
        >
          Informasi Pembeli
        </h2>
      </header>

      <div className="mt-5 space-y-4">
        <ReadOnlyField label="Nama Lengkap" value={name} />
        <ReadOnlyField label="Email" value={email} />
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Nomor Telepon <span className="font-medium normal-case tracking-normal text-zinc-400">(opsional)</span>
          </label>
          <PhoneField
            initialValue={initialPhone}
            onChange={onPhoneChange}
            error={phoneError}
          />
        </div>
      </div>
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <div className="flex h-11 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-sm font-medium text-zinc-700">
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
