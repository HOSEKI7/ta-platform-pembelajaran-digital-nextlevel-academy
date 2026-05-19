import "server-only";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { formatDateID } from "@/lib/format-date";

export type CertificatePdfInput = {
  recipientName: string;
  courseTitle: string;
  certificateNo: string;
  issuedAt: Date;
  expiresAt: Date | null;
  verifyUrl: string;
};

const BRAND = "#234AAE";
const BRAND_DARK = "#19295A";
const ACCENT = "#F4D600";
const INK = "#101828";
const MUTED = "#475467";
const BORDER = "#D8E7FE";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 36,
    fontFamily: "Helvetica",
    color: INK,
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: BRAND,
    borderRadius: 12,
    padding: 28,
    position: "relative",
  },
  innerLine: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: 8,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
  },
  wordmark: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    letterSpacing: 4,
    color: BRAND_DARK,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
  },
  badgeText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 1.6,
    color: BRAND_DARK,
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  eyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 5,
    color: MUTED,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    fontFamily: "Times-Bold",
    fontSize: 44,
    color: BRAND_DARK,
    letterSpacing: 1.5,
  },
  accentBar: {
    marginTop: 10,
    width: 56,
    height: 3,
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
  subText: {
    marginTop: 22,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.4,
  },
  recipient: {
    marginTop: 8,
    fontFamily: "Times-Italic",
    fontSize: 32,
    color: INK,
    textAlign: "center",
  },
  recipientUnderline: {
    marginTop: 8,
    width: 240,
    height: 0.75,
    backgroundColor: BORDER,
  },
  courseLabel: {
    marginTop: 22,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  courseTitle: {
    marginTop: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    color: INK,
    textAlign: "center",
    maxWidth: 540,
  },
  metaRow: {
    marginTop: 32,
    flexDirection: "row",
    gap: 48,
    justifyContent: "center",
  },
  metaItem: {
    alignItems: "center",
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 1.8,
    color: MUTED,
    textTransform: "uppercase",
  },
  metaValue: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: INK,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 0.75,
    borderTopColor: BORDER,
  },
  footerCol: {
    maxWidth: 320,
  },
  footerLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    letterSpacing: 1.6,
    color: MUTED,
    textTransform: "uppercase",
  },
  footerValue: {
    marginTop: 3,
    fontFamily: "Courier-Bold",
    fontSize: 10.5,
    color: INK,
  },
  footerValueRight: {
    marginTop: 3,
    fontSize: 9.5,
    color: BRAND_DARK,
    textAlign: "right",
  },
});

function CertificateDocument({
  recipientName,
  courseTitle,
  certificateNo,
  issuedAt,
  expiresAt,
  verifyUrl,
}: CertificatePdfInput) {
  const issuedLabel = formatDateID(issuedAt);
  const expiresLabel = expiresAt ? formatDateID(expiresAt) : null;

  return (
    <Document
      title={`Sertifikat ${certificateNo}`}
      author="NextLevel Academy"
      subject={`Sertifikat Penyelesaian Kursus — ${courseTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.innerLine} />

          <View style={styles.topBar}>
            <Text style={styles.wordmark}>NEXTLEVEL ACADEMY</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SERTIFIKAT RESMI</Text>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.eyebrow}>Sertifikat Penyelesaian</Text>
            <Text style={styles.title}>SERTIFIKAT</Text>
            <View style={styles.accentBar} />

            <Text style={styles.subText}>Diberikan kepada</Text>
            <Text style={styles.recipient}>{recipientName}</Text>
            <View style={styles.recipientUnderline} />

            <Text style={styles.courseLabel}>
              atas penyelesaian kursus berikut dengan progres 100%
            </Text>
            <Text style={styles.courseTitle}>{courseTitle}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Tanggal Terbit</Text>
                <Text style={styles.metaValue}>{issuedLabel}</Text>
              </View>
              {expiresLabel ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Berlaku Hingga</Text>
                  <Text style={styles.metaValue}>{expiresLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Nomor Sertifikat</Text>
              <Text style={styles.footerValue}>{certificateNo}</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Verifikasi Publik</Text>
              <Text style={styles.footerValueRight}>{verifyUrl}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(
  input: CertificatePdfInput,
): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument {...input} />);
}
