import "server-only";

import { PDFDocument } from "pdf-lib";

/**
 * Wraps an already-rendered certificate PNG in a single-page PDF whose page is
 * sized exactly to the image (so it prints edge-to-edge with no margins or
 * distortion). This is the ONLY way certificates become PDFs — there is no
 * separate PDF design, guaranteeing the PDF is pixel-identical to the PNG.
 */
export async function wrapPngInPdf(png: Buffer | Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const image = await doc.embedPng(png);
  const page = doc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  return doc.save();
}
