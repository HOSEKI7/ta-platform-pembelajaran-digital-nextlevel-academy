"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PAYMENT_GROUPS,
  paymentMethodById,
  paymentMethodsInGroup,
  type PaymentMethod,
  type PaymentMethodGroup,
} from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

const GROUP_ICONS: Record<PaymentMethodGroup, LucideIcon> = {
  qris: QrCode,
  va: Landmark,
  store: Store,
  cardless: CreditCard,
};

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
  // Auto-expand the group that currently holds the selected method on mount
  // (handy when the user re-renders the page with a previous selection),
  // otherwise start with everything collapsed so the card stays compact.
  // Single-option groups render as a direct row (no accordion) so never expand.
  const [expandedGroup, setExpandedGroup] = useState<PaymentMethodGroup | null>(
    () => {
      const selected = selectedMethod ? paymentMethodById(selectedMethod) : null;
      if (!selected) return null;
      return paymentMethodsInGroup(selected.group).length > 1 ? selected.group : null;
    },
  );

  const canSubmit = Boolean(selectedMethod) && agreedToTerms && !isSubmitting;
  const selectedMethodObj = useMemo(
    () => (selectedMethod ? paymentMethodById(selectedMethod) : null),
    [selectedMethod],
  );

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
          Powered by Midtrans
        </span>
      </header>

      <RadioGroup
        // Always pass a defined value ("" = nothing selected) so the group is
        // controlled from first render — switching undefined→string later trips
        // Base UI's uncontrolled→controlled warning.
        value={selectedMethod ?? ""}
        onValueChange={(value: string) => onMethodChange(value)}
        className="mt-6 grid gap-2.5"
      >
        {PAYMENT_GROUPS.map((group) => {
          const methods = paymentMethodsInGroup(group.id);
          const Icon = GROUP_ICONS[group.id];

          // Single-option groups (QRIS, Akulaku) render as a direct radio
          // panel so the student doesn't expand a dropdown for one item.
          if (methods.length === 1) {
            return (
              <SinglePaymentRow
                key={group.id}
                method={methods[0]!}
                groupLabel={group.label}
                Icon={Icon}
                selected={selectedMethod === methods[0]!.id}
              />
            );
          }

          const selectedInGroup =
            selectedMethodObj && selectedMethodObj.group === group.id
              ? selectedMethodObj
              : null;
          const isExpanded = expandedGroup === group.id;

          return (
            <PaymentGroupPanel
              key={group.id}
              group={group}
              methods={methods}
              Icon={Icon}
              expanded={isExpanded}
              selectedInGroup={selectedInGroup}
              onToggle={() =>
                setExpandedGroup((curr) => (curr === group.id ? null : group.id))
              }
              selectedMethodId={selectedMethod}
            />
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
        Transaksi diproses langsung oleh Midtrans dengan enkripsi standar
        PCI-DSS. Data pembayaranmu tidak pernah disimpan di server NextLevel Academy.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Single-option payment row (QRIS).                                          */
/* -------------------------------------------------------------------------- */

type SingleRowProps = {
  method: PaymentMethod;
  groupLabel: string;
  Icon: LucideIcon;
  selected: boolean;
};

function SinglePaymentRow({ method, groupLabel, Icon, selected }: SingleRowProps) {
  return (
    <label
      htmlFor={`pm-${method.id}`}
      className={cn(
        "group/row flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-3.5 py-3.5 transition",
        selected
          ? "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)]/50 ring-2 ring-[color:var(--color-brand-200)]"
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition",
          selected
            ? "bg-white text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-300)]"
            : "bg-zinc-50 text-zinc-600 ring-zinc-200",
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-900">
          {groupLabel}
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

/* -------------------------------------------------------------------------- */
/*  Multi-option payment group panel — accordion header + nested rows.        */
/* -------------------------------------------------------------------------- */

type GroupPanelProps = {
  group: { id: PaymentMethodGroup; label: string };
  methods: PaymentMethod[];
  Icon: LucideIcon;
  expanded: boolean;
  selectedInGroup: PaymentMethod | null;
  selectedMethodId: string | null;
  onToggle: () => void;
};

function PaymentGroupPanel({
  group,
  methods,
  Icon,
  expanded,
  selectedInGroup,
  selectedMethodId,
  onToggle,
}: GroupPanelProps) {
  const headingId = `pm-group-${group.id}-trigger`;
  const panelId = `pm-group-${group.id}-panel`;
  const hasSelection = selectedInGroup != null;

  return (
    <div
      data-state={expanded ? "open" : "closed"}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow,background-color] duration-200",
        hasSelection
          ? "border-[color:var(--color-brand-500)] bg-[color:var(--color-brand-50)]/40 ring-2 ring-[color:var(--color-brand-200)]"
          : expanded
            ? "border-[color:var(--color-brand-300)]"
            : "border-zinc-200 hover:border-zinc-300",
      )}
    >
      <button
        type="button"
        id={headingId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition",
          !hasSelection && "hover:bg-zinc-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        )}
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl ring-1 transition",
            hasSelection || expanded
              ? "bg-white text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-300)]"
              : "bg-zinc-50 text-zinc-600 ring-zinc-200",
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-zinc-900">
              {group.label}
            </span>
            {hasSelection ? (
              <span className="truncate text-[11px] font-semibold text-[color:var(--color-brand-700)]">
                • {selectedInGroup!.label}
              </span>
            ) : null}
          </span>
          <span className="block truncate text-[11px] text-zinc-500">
            {hasSelection
              ? selectedInGroup!.hint ?? `${methods.length} metode tersedia`
              : `${methods.length} metode tersedia`}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-zinc-400 transition-transform duration-300",
            expanded && "rotate-180 text-[color:var(--color-brand-600)]",
          )}
          strokeWidth={2.4}
          aria-hidden
        />
      </button>

      {/* The grid-rows trick gives us a smooth height animation without
          measuring content. The inner overflow-hidden clips during the
          transition; `inert` removes the collapsed children from the tab
          order and from assistive tech. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        inert={!expanded}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-1.5 border-t border-zinc-200/80 bg-[color:var(--color-brand-50)]/20 p-2.5">
            {methods.map((method) => (
              <NestedPaymentRow
                key={method.id}
                method={method}
                selected={selectedMethodId === method.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nested payment row inside an expanded group panel.                         */
/* -------------------------------------------------------------------------- */

function NestedPaymentRow({
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
        "group/row flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition",
        selected
          ? "border-[color:var(--color-brand-500)] ring-1 ring-[color:var(--color-brand-300)]"
          : "border-transparent hover:border-zinc-200 hover:bg-white",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-11 shrink-0 place-items-center rounded-md text-[10px] font-extrabold tracking-tight ring-1 transition",
          selected
            ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-200)]"
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
