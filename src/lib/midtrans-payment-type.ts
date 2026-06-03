/**
 * Human-readable Indonesian labels for Midtrans `payment_type` values.
 *
 * Since the buyer now picks the method inside the Snap popup, `Order.paymentMethod`
 * stores Midtrans' raw `payment_type` (set on success by the webhook/reconcile)
 * rather than one of our internal ids. This maps it for display (e.g. invoice).
 */
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  qris: "QRIS",
  bank_transfer: "Virtual Account",
  echannel: "Mandiri Bill",
  cstore: "Gerai Retail",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  dana: "DANA",
  akulaku: "Akulaku",
  kredivo: "Kredivo",
  credit_card: "Kartu Kredit",
};

/** Returns a display label for a Midtrans payment_type, or "—" when absent. */
export function formatMidtransPaymentType(
  paymentType: string | null | undefined,
): string {
  if (!paymentType) return "—";
  const known = PAYMENT_TYPE_LABELS[paymentType];
  if (known) return known;
  // Fallback: prettify an unknown raw value ("some_channel" → "Some Channel").
  return paymentType
    .split(/[_\s]+/)
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}
