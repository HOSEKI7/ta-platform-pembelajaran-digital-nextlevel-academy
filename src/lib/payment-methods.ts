/**
 * Static catalog of payment methods exposed on the checkout page. IDs are the
 * contract value sent to the backend and mapped to Midtrans Snap
 * `enabled_payments` codes (see `mapPaymentMethodToSnap` in `@/lib/midtrans`).
 * Labels are the Indonesian user-facing strings. Groups drive the visual
 * sectioning of the accordion on the right column.
 *
 * Keep IDs stable — they are persisted on `Order.paymentMethod`.
 */
export type PaymentMethodGroup = "qris" | "va" | "store" | "cardless";

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
  // QRIS (single, no nested options) — already covers GoPay/OVO/DANA/ShopeePay
  // and every QRIS-enabled m-banking app, so a dedicated e-wallet group is redundant.
  { id: "qris", label: "QRIS", hint: "Scan QR dari aplikasi e-wallet / m-banking apa pun", group: "qris", glyph: "QR" },
  // Virtual Account (Bank Transfer). Banks with a dedicated Midtrans Snap
  // channel get their own option; everything else goes through "Bank Lainnya"
  // (`other_va`), a VA payable from any bank — see `mapPaymentMethodToSnap`
  // in @/lib/midtrans.
  { id: "bca_va", label: "BCA Virtual Account", hint: "Bank Central Asia", group: "va", glyph: "BCA" },
  { id: "bri_va", label: "BRI Virtual Account", hint: "Bank Rakyat Indonesia", group: "va", glyph: "BRI" },
  { id: "bni_va", label: "BNI Virtual Account", hint: "Bank Negara Indonesia", group: "va", glyph: "BNI" },
  { id: "mandiri_va", label: "Mandiri Bill", hint: "Bank Mandiri", group: "va", glyph: "MDR" },
  { id: "permata_va", label: "Permata Virtual Account", hint: "Bank Permata", group: "va", glyph: "PRM" },
  { id: "cimb_va", label: "CIMB Niaga Virtual Account", hint: "Bank CIMB Niaga", group: "va", glyph: "CIMB" },
  { id: "other_va", label: "Bank Lainnya", hint: "VA dari bank lain (BSI, Danamon, dll.)", group: "va", glyph: "VA" },
  // Convenience Store
  { id: "indomaret", label: "Indomaret", hint: "Bayar tunai di kasir Indomaret", group: "store", glyph: "IND" },
  { id: "alfamart", label: "Alfamart", hint: "Bayar tunai di kasir Alfamart", group: "store", glyph: "ALF" },
  // Cardless Credit (PayLater)
  { id: "akulaku", label: "Akulaku PayLater", hint: "Cicilan tanpa kartu kredit", group: "cardless", glyph: "AKL" },
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
  iconName: "QrCode" | "Landmark" | "Store" | "CreditCard";
}[] = [
  { id: "qris", label: "QRIS", iconName: "QrCode" },
  { id: "va", label: "Virtual Account", iconName: "Landmark" },
  { id: "store", label: "Convenience Store", iconName: "Store" },
  { id: "cardless", label: "Kredit Tanpa Kartu", iconName: "CreditCard" },
];

export function paymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function paymentMethodsInGroup(group: PaymentMethodGroup): PaymentMethod[] {
  return PAYMENT_METHODS.filter((m) => m.group === group);
}
