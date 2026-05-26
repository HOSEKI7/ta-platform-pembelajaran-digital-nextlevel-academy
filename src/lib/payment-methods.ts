/**
 * Static catalog of payment methods exposed on the checkout page. IDs are the
 * contract value sent to the backend and mapped to Midtrans Snap
 * `enabled_payments` codes (see `mapPaymentMethodToSnap` in `@/lib/midtrans`).
 * Labels are the Indonesian user-facing strings. Groups drive the visual
 * sectioning of the accordion on the right column.
 *
 * Keep IDs stable — they are persisted on `Order.paymentMethod`.
 */
export type PaymentMethodGroup = "qris" | "ewallet" | "va" | "store";

export type PaymentMethod = {
  id: string;
  label: string;
  group: PaymentMethodGroup;
  /** Short hint shown under the label (e.g. "Bank Central Asia"). */
  hint?: string;
  /** Short text glyph until real brand logos are sourced. */
  glyph: string;
};

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  // QRIS (single, no nested options)
  { id: "qris", label: "QRIS", hint: "Scan QR dari aplikasi e-wallet apa pun", group: "qris", glyph: "QR" },
  // E-Wallet
  { id: "gopay", label: "GoPay", hint: "Saldo GoPay", group: "ewallet", glyph: "GP" },
  { id: "ovo", label: "OVO", hint: "Saldo OVO", group: "ewallet", glyph: "OV" },
  { id: "dana", label: "DANA", hint: "Saldo DANA", group: "ewallet", glyph: "DN" },
  { id: "shopeepay", label: "ShopeePay", hint: "Saldo ShopeePay", group: "ewallet", glyph: "SP" },
  // Bank Transfer (Virtual Account)
  { id: "bca_va", label: "BCA Virtual Account", hint: "Bank Central Asia", group: "va", glyph: "BCA" },
  { id: "mandiri_va", label: "Mandiri Virtual Account", hint: "Bank Mandiri", group: "va", glyph: "MDR" },
  { id: "bri_va", label: "BRI Virtual Account", hint: "Bank Rakyat Indonesia", group: "va", glyph: "BRI" },
  { id: "bni_va", label: "BNI Virtual Account", hint: "Bank Negara Indonesia", group: "va", glyph: "BNI" },
  // Convenience Store
  { id: "indomaret", label: "Indomaret", hint: "Bayar tunai di kasir Indomaret", group: "store", glyph: "IND" },
  { id: "alfamart", label: "Alfamart", hint: "Bayar tunai di kasir Alfamart", group: "store", glyph: "ALF" },
] as const;

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((m) => m.id) as [
  string,
  ...string[],
];

/**
 * Display order for the accordion. QRIS comes first as the universal "fastest"
 * option; the rest descend by typical Indonesian e-commerce preference.
 */
export const PAYMENT_GROUPS: {
  id: PaymentMethodGroup;
  label: string;
  /** Lucide icon name (resolved at render time). */
  iconName: "QrCode" | "Wallet" | "Landmark" | "Store";
}[] = [
  { id: "qris", label: "QRIS", iconName: "QrCode" },
  { id: "ewallet", label: "E-Wallet", iconName: "Wallet" },
  { id: "va", label: "Bank Transfer", iconName: "Landmark" },
  { id: "store", label: "Convenience Store", iconName: "Store" },
];

export function paymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function paymentMethodsInGroup(group: PaymentMethodGroup): PaymentMethod[] {
  return PAYMENT_METHODS.filter((m) => m.group === group);
}
