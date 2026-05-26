import { Button, Section, Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  name: string;
  courseTitle: string;
  learnUrl: string;
  transactionUrl: string;
  invoiceNumber: string;
  /** Formatted IDR string, e.g. "Rp 299.000". */
  amountLabel: string;
};

/**
 * Sent once an order transitions to SUCCESS (webhook or dev fallback) — see
 * src/lib/payment/fulfillment.ts. Confirms the purchase and links straight to
 * the now-unlocked course.
 */
export function OrderConfirmationEmail({
  name,
  courseTitle,
  learnUrl,
  transactionUrl,
  invoiceNumber,
  amountLabel,
}: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <EmailLayout preview={`Pembayaran berhasil — ${courseTitle} sudah aktif`}>
      <Text style={styles.heading}>Pembayaran berhasil 🎉</Text>
      <Text style={styles.paragraph}>
        Halo {firstName}, terima kasih! Pembayaranmu untuk kursus{" "}
        <strong>{courseTitle}</strong> sudah kami terima dan kursus kini aktif
        seumur hidup di akunmu.
      </Text>

      <Section style={summary}>
        <Row label="No. Invoice" value={invoiceNumber} />
        <Row label="Kursus" value={courseTitle} />
        <Row label="Total Dibayar" value={amountLabel} />
      </Section>

      <Button href={learnUrl} style={styles.button}>
        Mulai Belajar
      </Button>

      <Text style={{ ...styles.muted, marginTop: "20px" }}>
        Lihat detail transaksi kapan saja di{" "}
        <a href={transactionUrl} style={styles.fallbackLink}>
          halaman transaksi
        </a>
        .
      </Text>
      <Text style={styles.muted}>
        Catatan: sesuai kebijakan, tidak ada pengembalian dana setelah pembayaran
        berhasil dan kursus aktif.
      </Text>
    </EmailLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={row}>
      <span style={rowLabel}>{label}</span>
      <span style={rowValue}>{value}</span>
    </Text>
  );
}

const summary: React.CSSProperties = {
  backgroundColor: "#F4F6FB",
  borderRadius: "10px",
  padding: "16px 18px",
  margin: "0 0 20px",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  margin: "0 0 8px",
  fontSize: "14px",
};

const rowLabel: React.CSSProperties = { color: "#6B7280" };
const rowValue: React.CSSProperties = { color: "#1A1A2E", fontWeight: 600 };

export default OrderConfirmationEmail;
