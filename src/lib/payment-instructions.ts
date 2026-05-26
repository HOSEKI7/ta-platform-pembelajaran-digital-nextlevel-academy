import { paymentMethodById, type PaymentMethodGroup } from "@/lib/payment-methods";

/**
 * Short "how to pay" copy shown on our branded payment page before the Snap
 * popup opens. Keyed by payment-method group (see payment-methods.ts). The
 * exact VA number / QR / deeplink is rendered by Snap itself — this is the
 * orientation text so the page is informative on its own (PRD §6.4.2).
 */
type Instruction = {
  title: string;
  steps: string[];
};

const GROUP_INSTRUCTIONS: Record<PaymentMethodGroup, Instruction> = {
  qris: {
    title: "Pembayaran QRIS",
    steps: [
      "Klik “Bayar Sekarang” untuk menampilkan kode QR.",
      "Buka aplikasi e-wallet atau m-banking apa pun yang mendukung QRIS.",
      "Pindai kode QR lalu konfirmasi pembayaran sebesar tagihan.",
      "Status otomatis diperbarui begitu pembayaran terkonfirmasi.",
    ],
  },
  ewallet: {
    title: "Pembayaran E-Wallet",
    steps: [
      "Klik “Bayar Sekarang” untuk membuka instruksi pembayaran.",
      "Selesaikan pembayaran di aplikasi e-wallet yang kamu pilih.",
      "Pastikan nominal yang dibayar sesuai dengan total tagihan.",
      "Halaman ini akan otomatis memperbarui status setelah berhasil.",
    ],
  },
  va: {
    title: "Transfer Bank (Virtual Account)",
    steps: [
      "Klik “Bayar Sekarang” untuk mendapatkan nomor Virtual Account.",
      "Transfer ke nomor VA tersebut melalui ATM / m-banking / internet banking.",
      "Masukkan nominal persis sesuai total tagihan.",
      "Pembayaran terverifikasi otomatis dalam beberapa menit.",
    ],
  },
  store: {
    title: "Bayar di Gerai Retail",
    steps: [
      "Klik “Bayar Sekarang” untuk mendapatkan kode pembayaran.",
      "Tunjukkan kode pembayaran ke kasir Indomaret / Alfamart.",
      "Bayar tunai sesuai total tagihan dan simpan struk sebagai bukti.",
      "Status diperbarui otomatis setelah kasir memproses pembayaran.",
    ],
  },
};

/** Resolves the instruction block for a stored `Order.paymentMethod` id. */
export function paymentInstructionsFor(methodId: string | null): Instruction {
  const group = methodId ? paymentMethodById(methodId)?.group : undefined;
  return GROUP_INSTRUCTIONS[group ?? "qris"];
}
