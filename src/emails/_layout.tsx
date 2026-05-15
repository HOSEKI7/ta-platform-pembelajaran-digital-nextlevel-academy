import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const BRAND_BLUE = "#478EF4"; // PRD §12.1 primary
const TEXT_PRIMARY = "#1A1A2E";
const TEXT_SECONDARY = "#6B7280";

type Props = {
  preview: string;
  children: ReactNode;
};

/**
 * Shared brand chrome for transactional emails — header, footer, and resets.
 * Individual templates compose `<EmailLayout>` and supply their own body copy.
 */
export function EmailLayout({ preview, children }: Props) {
  return (
    <Html lang="id">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandText}>NextLevel Academy</Text>
          </Section>
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Section>
            <Text style={footer}>
              Email ini dikirim otomatis. Jangan balas ke alamat ini. Jika kamu
              butuh bantuan, hubungi tim dukungan NextLevel Academy.
            </Text>
            <Text style={footerSmall}>
              © {new Date().getFullYear()} NextLevel Academy
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const styles = {
  heading: {
    color: TEXT_PRIMARY,
    fontSize: "22px",
    fontWeight: 700,
    margin: "0 0 16px",
  },
  paragraph: {
    color: TEXT_PRIMARY,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 12px",
  },
  muted: {
    color: TEXT_SECONDARY,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 8px",
  },
  button: {
    backgroundColor: BRAND_BLUE,
    color: "#FFFFFF",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
  },
  fallbackLink: {
    color: BRAND_BLUE,
    fontSize: "13px",
    wordBreak: "break-all" as const,
  },
} as const;

const body: React.CSSProperties = {
  backgroundColor: "#F4F6FB",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "32px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const brand: React.CSSProperties = {
  borderBottom: "1px solid #E5E7EB",
  marginBottom: "24px",
  paddingBottom: "16px",
};

const brandText: React.CSSProperties = {
  color: BRAND_BLUE,
  fontSize: "20px",
  fontWeight: 700,
  margin: 0,
};

const content: React.CSSProperties = {
  marginBottom: "24px",
};

const hr: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  color: TEXT_SECONDARY,
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 4px",
};

const footerSmall: React.CSSProperties = {
  color: TEXT_SECONDARY,
  fontSize: "11px",
  margin: 0,
};
