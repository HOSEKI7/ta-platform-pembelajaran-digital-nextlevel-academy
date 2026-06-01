/**
 * Pure naming helpers for internship Batch / Bidang / Kelas labels.
 *
 * Safe to import from BOTH Server and Client Components — keep this file free of
 * any `server-only` / Prisma imports (only string utilities).
 *
 * Storage convention (after `scripts/normalize-internship-names.ts`):
 * - `Batch.name`  = "Batch 1 2026"                          (clean)
 * - `Field.name`  = "Web Programming"                       (clean — no batch prefix)
 * - `Class.name`  = "Batch 1 2026 - Web Programming - A"    (composite, globally unique)
 *
 * The class has no dedicated letter column by design, so its display letter is
 * the trailing segment of the composite name. Full labels are built from each
 * name part individually — never by reusing a pre-composed string.
 */

/** Trailing segment (the letter) of a composite class name, e.g. "… - A" → "A". */
export function classLetter(className: string): string {
  return className.split(" - ").pop()?.trim() || className;
}

/** Full "[Batch] - [Bidang] - [Kelas]" label, assembled from each name part. */
export function internshipClassLabel(parts: {
  batchName: string;
  fieldName: string;
  className: string;
}): string {
  return `${parts.batchName} - ${parts.fieldName} - ${classLetter(parts.className)}`;
}
