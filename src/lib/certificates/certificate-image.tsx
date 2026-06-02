/* eslint-disable @next/next/no-img-element -- this JSX is rendered by Satori to
   SVG, not the DOM; `<img>` with a data-URI src is the only supported image. */
import "server-only";

import satori from "satori";
import sharp from "sharp";

import { formatDateID } from "@/lib/format-date";

import { getLogoDataUri, getVerifyQrDataUri } from "./cert-assets";
import { loadCertificateFonts } from "./cert-fonts";

/**
 * THE single source of certificate design. The JSX below is rendered by Satori
 * to SVG, then rasterised by Sharp to a high-resolution PNG. The public page
 * shows this PNG as an `<img>`, and the "Download PDF" route merely wraps the
 * SAME PNG in a one-page PDF — so the image and the PDF are guaranteed
 * identical forever. There is intentionally NO separate PDF renderer.
 *
 * Satori constraints honoured here: flexbox only (no CSS grid), explicit
 * `display: flex` on every multi-child container, gradients via `background`,
 * images embedded as data URIs, and a single bundled font family (Poppins) so
 * no glyph triggers Satori's network-dependent emoji fallback.
 */

export type CertificateImageInput = {
  recipientName: string;
  courseTitle: string;
  certificateNo: string;
  issuedAt: Date;
  expiresAt: Date | null;
  verifyUrl: string;
};

// Canvas — A4 landscape ratio (√2 : 1) at high DPI so it stays crisp when the
// PDF wrapper prints it at full page size.
const WIDTH = 2000;
const HEIGHT = 1414;

const BRAND = "#234AAE";
const BRAND_LIGHT = "#478EF4";
const BRAND_DARK = "#19295A";
const ACCENT = "#F4D600";
const INK = "#101828";
const MUTED = "#5A6B86";
const BORDER = "#D8E7FE";

function CertificateLayout({
  recipientName,
  courseTitle,
  certificateNo,
  issuedAt,
  expiresAt,
  verifyUrl,
  logoSrc,
  qrSrc,
}: CertificateImageInput & { logoSrc: string; qrSrc: string }) {
  const issuedLabel = formatDateID(issuedAt);
  const expiresLabel = expiresAt ? formatDateID(expiresAt) : null;
  const verifyUrlShort = verifyUrl.replace(/^https?:\/\//, "");

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
        fontFamily: "Poppins",
        padding: 40,
        position: "relative",
      }}
    >
      {/* Soft brand wash behind everything */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(900px 600px at 0% 0%, rgba(71,142,244,0.14), transparent 60%), radial-gradient(900px 600px at 100% 100%, rgba(244,214,0,0.16), transparent 60%)",
        }}
      />

      {/* Framed card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: 28,
          border: `6px solid ${BRAND}`,
          backgroundColor: "#FFFFFF",
          padding: 64,
          boxShadow: "0 40px 90px rgba(35,65,137,0.18)",
        }}
      >
        {/* Inner hairline frame */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            borderRadius: 18,
            border: `2px solid ${BORDER}`,
          }}
        />

        {/* Decorative corner wedges */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -2,
            left: -2,
            width: 220,
            height: 220,
            background: `linear-gradient(135deg, ${BRAND_LIGHT}, transparent 70%)`,
            borderTopLeftRadius: 26,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 240,
            height: 240,
            background: `linear-gradient(315deg, ${ACCENT}, transparent 70%)`,
            borderBottomRightRadius: 26,
            opacity: 0.5,
          }}
        />

        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logoSrc} width={300} height={66} alt="NextLevel Academy" />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingLeft: 22,
              paddingRight: 22,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 999,
              backgroundColor: "#EEF5FF",
              border: `2px solid ${BORDER}`,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: ACCENT,
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 4,
                color: BRAND_DARK,
              }}
            >
              SERTIFIKAT RESMI
            </span>
          </div>
        </div>

        {/* BODY */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexGrow: 1,
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 10,
              color: MUTED,
            }}
          >
            SERTIFIKAT PENYELESAIAN
          </span>
          <span
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: 4,
              color: BRAND_DARK,
              marginTop: 6,
            }}
          >
            SERTIFIKAT
          </span>
          <div
            style={{
              display: "flex",
              width: 120,
              height: 8,
              borderRadius: 999,
              backgroundColor: ACCENT,
              marginTop: 16,
            }}
          />

          <span
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: MUTED,
              marginTop: 44,
            }}
          >
            Diberikan dengan bangga kepada
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: BRAND,
              marginTop: 10,
            }}
          >
            {recipientName}
          </span>
          <div
            style={{
              display: "flex",
              width: 520,
              height: 3,
              backgroundColor: BORDER,
              marginTop: 18,
            }}
          />

          <span
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: MUTED,
              marginTop: 30,
            }}
          >
            atas penyelesaian penuh seluruh materi pembelajaran kursus
          </span>
          <span
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: INK,
              marginTop: 12,
              maxWidth: 1400,
            }}
          >
            {courseTitle}
          </span>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              gap: 96,
              marginTop: 46,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: MUTED,
                }}
              >
                TANGGAL TERBIT
              </span>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: INK,
                  marginTop: 8,
                }}
              >
                {issuedLabel}
              </span>
            </div>
            {expiresLabel ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 3,
                    color: MUTED,
                  }}
                >
                  BERLAKU HINGGA
                </span>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: INK,
                    marginTop: 8,
                  }}
                >
                  {expiresLabel}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            position: "relative",
            paddingTop: 28,
            borderTop: `2px solid ${BORDER}`,
          }}
        >
          {/* Signature */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 460,
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: BRAND_DARK,
                fontStyle: "italic",
              }}
            >
              Kevin Arya Swardhana
            </span>
            <div
              style={{
                display: "flex",
                width: 360,
                height: 2,
                backgroundColor: "#C9D6EC",
                marginTop: 6,
                marginBottom: 10,
              }}
            />
            <span style={{ fontSize: 24, fontWeight: 700, color: INK }}>
              Kevin Arya Swardhana
            </span>
            <span style={{ fontSize: 20, fontWeight: 400, color: MUTED }}>
              Chief Executive Officer, NextLevel Academy
            </span>
          </div>

          {/* Certificate identity */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flexGrow: 1,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 3,
                color: MUTED,
              }}
            >
              NOMOR SERTIFIKAT
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: BRAND_DARK,
                marginTop: 6,
              }}
            >
              {certificateNo}
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: BRAND,
                marginTop: 6,
              }}
            >
              {verifyUrlShort}
            </span>
          </div>

          {/* QR */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 10,
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                border: `3px solid ${BORDER}`,
              }}
            >
              <img src={qrSrc} width={150} height={150} alt="QR verifikasi" />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: MUTED,
                marginTop: 8,
              }}
            >
              Pindai untuk verifikasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the certificate to a high-resolution PNG buffer. Loads fonts + logo
 * + QR, runs Satori → SVG, then Sharp → PNG.
 */
export async function renderCertificatePng(
  input: CertificateImageInput,
): Promise<Buffer> {
  const [fonts, logoSrc, qrSrc] = await Promise.all([
    loadCertificateFonts(),
    getLogoDataUri(),
    getVerifyQrDataUri(input.verifyUrl),
  ]);

  const svg = await satori(
    <CertificateLayout {...input} logoSrc={logoSrc} qrSrc={qrSrc} />,
    { width: WIDTH, height: HEIGHT, fonts },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
