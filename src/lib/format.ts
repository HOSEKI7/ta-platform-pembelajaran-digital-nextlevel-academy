/**
 * Indonesian Rupiah currency formatter. Shared across student-facing surfaces
 * (catalog card, dashboard recommendations, course preview popup) so prices
 * render consistently as "Rp 299.000" — no decimals, locale-aware separators.
 */
export const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/**
 * Human-friendly duration label for course estimated-minutes. Returns
 * "Akses seumur hidup" when null (lifetime access), "{n} menit" under an
 * hour, and "{n} jam belajar" otherwise.
 */
export function courseDurationText(minutes: number | null): string {
  if (!minutes) return "Akses seumur hidup";
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.round(minutes / 60);
  return `${hours} jam belajar`;
}
