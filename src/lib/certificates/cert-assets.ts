import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";
import sharp from "sharp";

/**
 * Server-side asset helpers for the certificate renderer. Satori embeds images
 * only as data URIs, so both the brand logo and the verification QR are turned
 * into base64 PNG data URIs here.
 *
 * The logo lives as WebP in `public/` (Satori/resvg can't decode WebP), so it's
 * transcoded to PNG via Sharp once and memoised for the process lifetime.
 */

const LOGO_PATH = path.join(
  process.cwd(),
  "public",
  "nla-horizontal-logo.webp",
);

let logoPromise: Promise<string> | null = null;

/** Returns the NextLevel wordmark logo as a PNG data URI (transcoded once). */
export function getLogoDataUri(): Promise<string> {
  if (!logoPromise) {
    logoPromise = (async () => {
      const webp = await readFile(LOGO_PATH);
      const png = await sharp(webp).png().toBuffer();
      return `data:image/png;base64,${png.toString("base64")}`;
    })();
  }
  return logoPromise;
}

/**
 * Renders a QR code (PNG data URI) that points at the public verification URL.
 * High error-correction + brand-dark modules so it scans reliably even printed
 * small on a certificate.
 */
export async function getVerifyQrDataUri(verifyUrl: string): Promise<string> {
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#19295A", light: "#FFFFFF" },
  });
}
