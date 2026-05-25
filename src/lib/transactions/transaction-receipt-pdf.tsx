import "server-only";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { idr } from "@/lib/format";
import { formatDateID, formatTimeID } from "@/lib/format-date";

export type TransactionReceiptInput = {
  transactionId: string;
  invoiceId: string | null;
  customerName: string;
  courseTitle: string;
  paymentMethod: string | null;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  voucherCode: string | null;
  checkoutAt: Date;
  paidAt: Date | null;
};

const BRAND = "#234AAE";
const BRAND_DARK = "#19295A";
const INK = "#101828";
const MUTED = "#475467";
const BORDER = "#D8E7FE";
const SUCCESS = "#047857";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
    color: INK,
    fontSize: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
  },
  wordmark: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    letterSpacing: 3,
    color: BRAND_DARK,
  },
  docTitle: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: MUTED,
    textTransform: "uppercase",
  },
  paidBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
  },
  paidBadgeText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1.5,
    color: SUCCESS,
  },
  metaGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaCell: {
    width: "50%",
    marginBottom: 14,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    letterSpacing: 1.4,
    color: MUTED,
    textTransform: "uppercase",
  },
  metaValue: {
    marginTop: 3,
    fontSize: 10.5,
    color: INK,
  },
  metaValueMono: {
    marginTop: 3,
    fontFamily: "Courier-Bold",
    fontSize: 10,
    color: INK,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1.6,
    color: BRAND_DARK,
    textTransform: "uppercase",
  },
  courseBox: {
    padding: 14,
    borderWidth: 0.75,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: "#F8FAFF",
  },
  courseLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    letterSpacing: 1.4,
    color: MUTED,
    textTransform: "uppercase",
  },
  courseTitle: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: INK,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  amountLabel: {
    fontSize: 10.5,
    color: MUTED,
  },
  amountValue: {
    fontSize: 10.5,
    color: INK,
  },
  discountValue: {
    fontSize: 10.5,
    color: SUCCESS,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: BRAND_DARK,
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: BRAND,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 0.75,
    borderTopColor: BORDER,
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.5,
  },
});

function dateTimeLabel(date: Date): string {
  return `${formatDateID(date)} · ${formatTimeID(date)} WIB`;
}

function ReceiptDocument({
  transactionId,
  invoiceId,
  customerName,
  courseTitle,
  paymentMethod,
  originalPrice,
  discountAmount,
  finalPrice,
  voucherCode,
  checkoutAt,
  paidAt,
}: TransactionReceiptInput) {
  const hasDiscount = discountAmount > 0;

  return (
    <Document
      title={`Bukti Transaksi ${transactionId}`}
      author="NextLevel Academy"
      subject={`Bukti pembayaran kursus — ${courseTitle}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.wordmark}>NEXTLEVEL ACADEMY</Text>
            <Text style={styles.docTitle}>Bukti Transaksi</Text>
          </View>
          <View style={styles.paidBadge}>
            <Text style={styles.paidBadgeText}>LUNAS</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ID Transaksi</Text>
            <Text style={styles.metaValueMono}>{transactionId}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ID Invoice</Text>
            <Text style={styles.metaValueMono}>{invoiceId ?? "—"}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Atas Nama</Text>
            <Text style={styles.metaValue}>{customerName}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Metode Pembayaran</Text>
            <Text style={styles.metaValue}>{paymentMethod ?? "—"}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Waktu Checkout</Text>
            <Text style={styles.metaValue}>{dateTimeLabel(checkoutAt)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Waktu Pembayaran</Text>
            <Text style={styles.metaValue}>
              {paidAt ? dateTimeLabel(paidAt) : "—"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kursus</Text>
        <View style={styles.courseBox}>
          <Text style={styles.courseLabel}>Item</Text>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
        </View>

        <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
        <View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Harga Asli</Text>
            <Text style={styles.amountValue}>{idr.format(originalPrice)}</Text>
          </View>
          {hasDiscount ? (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>
                Diskon{voucherCode ? ` (${voucherCode})` : ""}
              </Text>
              <Text style={styles.discountValue}>
                − {idr.format(discountAmount)}
              </Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Dibayar</Text>
            <Text style={styles.totalValue}>{idr.format(finalPrice)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Dokumen ini diterbitkan otomatis oleh NextLevel Academy sebagai bukti
            pembayaran yang sah dan tidak memerlukan tanda tangan. Pembelian
            bersifat final — tidak ada pengembalian dana setelah kursus aktif.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderTransactionReceiptPdf(
  input: TransactionReceiptInput,
): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument {...input} />);
}
