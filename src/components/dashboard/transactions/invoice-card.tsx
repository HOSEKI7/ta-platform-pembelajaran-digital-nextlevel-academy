import type { TransactionDetailDTO, TransactionStatus } from "@/lib/transaction-data-loader";
import { formatDateID, formatTimeID } from "@/lib/format-date";
import { idr } from "@/lib/format";
import { formatMidtransPaymentType } from "@/lib/midtrans-payment-type";

/**
 * Self-contained purchase invoice. Rendered on the detail page AND captured
 * to a PNG on download — so it must hold every relevant fact and contain NO
 * images, buttons, or hyperlinks, and use only explicit hex colours (Tailwind
 * v4 / shadcn theme tokens are oklch, which DOM-to-image rasterizers handle
 * inconsistently). Keep this subtree free of theme colour classes.
 */

type Props = {
  tx: TransactionDetailDTO;
  customer: { name: string; email: string };
};

const STATUS_PILL: Record<
  TransactionStatus,
  { label: string; color: string; bg: string }
> = {
  SUCCESS: { label: "LUNAS", color: "#047857", bg: "#ecfdf5" },
  PENDING: { label: "MENUNGGU PEMBAYARAN", color: "#b45309", bg: "#fffbeb" },
  FAILED: { label: "GAGAL", color: "#b91c1c", bg: "#fef2f2" },
  EXPIRED: { label: "KEDALUWARSA", color: "#52525b", bg: "#f4f4f5" },
  CANCELED: { label: "DIBATALKAN", color: "#be123c", bg: "#fff1f2" },
};

function dt(iso: string): string {
  return `${formatDateID(iso)} · ${formatTimeID(iso)} WIB`;
}

export function InvoiceCard({ tx, customer }: Props) {
  const pill = STATUS_PILL[tx.status];
  const hasDiscount = tx.pricing.discountAmount > 0;
  const invoiceNo = tx.paymentInvoiceId ?? tx.id;

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e4e4e7] bg-white">
      <div className="h-1.5 w-full bg-[#225bd7]" />

      <div className="flex flex-col gap-8 p-7 sm:p-9">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- plain <img> required so html-to-image reliably inlines the logo into the downloaded PNG (next/image lazy-loading/srcset breaks the capture). */}
            <img
              src="/NextLevel_Mini_Logo.webp"
              alt="NextLevel Academy"
              width={40}
              height={40}
              className="size-10 shrink-0 object-contain"
            />
            <div>
              <p className="font-heading text-[15px] font-extrabold leading-tight text-[#18181b]">
                NextLevel Academy
              </p>
              <p className="text-[11px] text-[#71717a]">nextlevel.academy</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-heading text-xl font-extrabold tracking-tight text-[#18181b]">
              INVOICE
            </p>
            <span
              className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em]"
              style={{ color: pill.color, backgroundColor: pill.bg }}
            >
              {pill.label}
            </span>
          </div>
        </div>

        {/* Billed to + invoice meta */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa]">
              Ditagihkan Kepada
            </p>
            <p className="mt-2 text-sm font-bold text-[#18181b]">
              {customer.name}
            </p>
            <p className="truncate text-[13px] text-[#71717a]">
              {customer.email}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <MetaLine label="No. Invoice" value={invoiceNo} mono />
            <MetaLine label="Tanggal Terbit" value={dt(tx.checkoutAt)} />
            <MetaLine
              label="Tanggal Bayar"
              value={tx.paidAt ? dt(tx.paidAt) : "—"}
            />
            <MetaLine label="Metode" value={formatMidtransPaymentType(tx.paymentMethod)} />
          </div>
        </div>

        {/* Line items */}
        <div className="overflow-hidden rounded-2xl border border-[#e4e4e7]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-[#f8fafc] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71717a]">
            <span>Deskripsi</span>
            <span className="text-center">Jumlah</span>
            <span className="text-right">Harga</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] items-start gap-4 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#18181b]">
                {tx.course.title}
              </p>
              <p className="mt-0.5 text-xs text-[#71717a]">
                {tx.course.categoryName} · {tx.course.instructor}
              </p>
              <p className="mt-1 text-[11px] text-[#a1a1aa]">
                Akses seumur hidup
              </p>
            </div>
            <span className="text-center text-sm text-[#3f3f46]">1</span>
            <span className="text-right text-sm font-semibold text-[#18181b]">
              {idr.format(tx.pricing.originalPrice)}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="flex w-full flex-col gap-2.5 sm:w-72">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#71717a]">Subtotal</span>
              <span className="font-semibold text-[#18181b]">
                {idr.format(tx.pricing.originalPrice)}
              </span>
            </div>
            {hasDiscount ? (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#71717a]">
                  Diskon{tx.voucher ? ` · ${tx.voucher.code}` : ""}
                </span>
                <span className="font-semibold text-[#047857]">
                  − {idr.format(tx.pricing.discountAmount)}
                </span>
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between border-t border-[#e4e4e7] pt-3">
              <span className="text-sm font-bold text-[#18181b]">Total</span>
              <span className="font-heading text-xl font-extrabold text-[#225bd7]">
                {idr.format(tx.pricing.finalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#f4f4f5] pt-5">
          <p className="text-[11px] leading-relaxed text-[#a1a1aa]">
            Invoice ini diterbitkan otomatis oleh NextLevel Academy sebagai bukti
            pembelian yang sah dan tidak memerlukan tanda tangan. Pembelian
            bersifat final — tidak ada pengembalian dana setelah kursus aktif.
          </p>
          <p className="mt-2 font-mono text-[10px] text-[#d4d4d8]">
            ID Transaksi · {tx.id}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaLine({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 sm:justify-end">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a1a1aa]">
        {label}
      </span>
      <span
        className={`text-[13px] text-[#3f3f46] ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
