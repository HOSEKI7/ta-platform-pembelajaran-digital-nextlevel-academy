import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Font } from "satori";

/**
 * Loads the bundled Poppins TTF weights for Satori. Fonts are kept in-repo
 * (`src/lib/certificates/fonts/`) and read from disk via `fs` — never fetched
 * from a CDN at runtime — so the renderer works deterministically in
 * serverless environments and covers every Latin glyph an Indonesian name or
 * course title can produce (avoiding Satori's emoji-fallback path, which can
 * fail without network access).
 *
 * The buffers are loaded once and memoised for the lifetime of the process.
 */

const FONT_DIR = path.join(process.cwd(), "src", "lib", "certificates", "fonts");

type FontSpec = { file: string; weight: Font["weight"] };

const POPPINS_WEIGHTS: FontSpec[] = [
  { file: "Poppins-Regular.ttf", weight: 400 },
  { file: "Poppins-Medium.ttf", weight: 500 },
  { file: "Poppins-SemiBold.ttf", weight: 600 },
  { file: "Poppins-Bold.ttf", weight: 700 },
  { file: "Poppins-ExtraBold.ttf", weight: 800 },
];

let cached: Font[] | null = null;

export async function loadCertificateFonts(): Promise<Font[]> {
  if (cached) return cached;
  const fonts = await Promise.all(
    POPPINS_WEIGHTS.map(async ({ file, weight }) => {
      const data = await readFile(path.join(FONT_DIR, file));
      return {
        name: "Poppins",
        data,
        weight,
        style: "normal",
      } satisfies Font;
    }),
  );
  cached = fonts;
  return fonts;
}
