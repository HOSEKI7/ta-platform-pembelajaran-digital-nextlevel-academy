import { Button, Section, Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  name: string;
  courseTitle: string;
  /** Branded checkout URL that resumes the Snap popup for this pending order. */
  resumeUrl: string;
  transactionUrl: string;
  invoiceNumber: string;
  /** Formatted IDR string, e.g. "Rp 299.000". */
  amountLabel: string;
  /** Formatted deadline, e.g. "12/06/2026 14:30 WIB". */
  expiresAtLabel: string;
};

/**
 * Sent when a PENDING paid order is created (POST /api/orders) — reminds the
 * student to finish payment within the 60-minute window and links back to the
 * checkout page to reopen the Snap popup.
 */
export function OrderPendingEmail({
  name,
  courseTitle,
  resumeUrl,
  transactionUrl,
  invoiceNumber,
  amountLabel,
  expiresAtLabel,
}: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <EmailLayout preview={`Selesaikan pembayaran — ${courseTitle}`}>
      <Text style={styles.heading}>Menunggu pembayaran ⏳</Text>
      <Text style={styles.paragraph}>
        Halo {firstName}, pesananmu untuk kursus <strong>{courseTitle}</strong>{" "}
        sudah dibuat. Selesaikan pembayaran sebelum{" "}
        <strong>{expiresAtLabel}</strong> agar pesanan tidak kedaluwarsa.
      </Text>

      <Section style={summary}>
        <Row label="No. Invoice" value={invoiceNumber} />
        <Row label="Kursus" value={courseTitle} />
        <Row label="Total" value={amountLabel} />
        <Row label="Batas Waktu" value={expiresAtLabel} />
      </Section>

      <Button href={resumeUrl} style={styles.button}>
        Lanjutkan Pembayaran
      </Button>

      <Text style={{ ...styles.muted, marginTop: "20px" }}>
        Lihat status pesanan kapan saja di{" "}
        <a href={transactionUrl} style={styles.fallbackLink}>
          halaman transaksi
        </a>
        .
      </Text>
      <Text style={styles.muted}>
        Jika kamu sudah membayar, abaikan email ini — kursus aktif otomatis
        setelah pembayaran terkonfirmasi.
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

export default OrderPendingEmail;
