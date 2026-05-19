/**
 * Platform-wide date formatting in WIB (UTC+7) per CLAUDE.md. Always render
 * `DD/MM/YYYY` for user-facing dates — the PRD pins this format and the
 * timezone, so locale or server-host TZ never affects the output.
 */
export function formatDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
