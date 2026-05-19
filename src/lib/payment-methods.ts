/**
 * Static catalog of DOKU payment methods exposed on the checkout page.
 * IDs are the contract value sent to the backend (and eventually mapped to
 * DOKU channel codes when the gateway integration ships). Labels are the
 * Indonesian user-facing strings. Groups drive the visual sectioning of the
 * RadioGroup on the right column.
 *
 * Keep IDs stable — they are persisted on `Order.paymentMethod`.
 */
export type PaymentMethodGroup = "va" | "ewallet" | "qris" | "card";

export type PaymentMethod = {
  id: string;
  label: string;
  group: PaymentMethodGroup;
  /** Short hint shown under the label (e.g. "Bank Central Asia"). */
  hint?: string;
  /** Optional emoji/short text glyph until real bank logos are sourced. */
  glyph: string;
};

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  // Virtual Account
  { id: "bca_va", label: "BCA Virtual Account", hint: "Bank Central Asia", group: "va", glyph: "BCA" },
  { id: "mandiri_va", label: "Mandiri Virtual Account", hint: "Bank Mandiri", group: "va", glyph: "MDR" },
  { id: "bri_va", label: "BRI Virtual Account", hint: "Bank Rakyat Indonesia", group: "va", glyph: "BRI" },
  { id: "bni_va", label: "BNI Virtual Account", hint: "Bank Negara Indonesia", group: "va", glyph: "BNI" },
  // E-Wallet
  { id: "gopay", label: "GoPay", hint: "Saldo GoPay", group: "ewallet", glyph: "GP" },
  { id: "ovo", label: "OVO", hint: "Saldo OVO", group: "ewallet", glyph: "OV" },
  { id: "dana", label: "DANA", hint: "Saldo DANA", group: "ewallet", glyph: "DN" },
  { id: "shopeepay", label: "ShopeePay", hint: "Saldo ShopeePay", group: "ewallet", glyph: "SP" },
  // QRIS
  { id: "qris", label: "QRIS", hint: "Scan QR dari aplikasi e-wallet apa pun", group: "qris", glyph: "QR" },
  // Card
  { id: "credit_card", label: "Kartu Kredit/Debit", hint: "Visa • Mastercard • JCB", group: "card", glyph: "CC" },
] as const;

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((m) => m.id) as [
  string,
  ...string[],
];

export const PAYMENT_GROUPS: { id: PaymentMethodGroup; label: string }[] = [
  { id: "va", label: "Transfer Bank (Virtual Account)" },
  { id: "ewallet", label: "E-Wallet" },
  { id: "qris", label: "QRIS" },
  { id: "card", label: "Kartu Kredit/Debit" },
];

export function paymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
