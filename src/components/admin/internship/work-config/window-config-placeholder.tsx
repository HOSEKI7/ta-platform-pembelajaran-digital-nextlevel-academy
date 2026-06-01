import { Clock, Construction } from "lucide-react";

/**
 * Placeholder for the upcoming "Window Absen" tab (check-in window configuration
 * — PRD §6.9.2). The window is currently a global constant
 * (`INTERNSHIP_CHECKIN_WINDOW`, default 09:00–12:00); promoting it to an
 * editable setting is planned. Rendered as a "coming soon" panel for now.
 */
export function WindowConfigPlaceholder() {
  return (
    <div className="grid place-items-center gap-4 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
        <Construction className="size-7" strokeWidth={2} />
      </span>
      <div className="max-w-md space-y-1.5">
        <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
          Konfigurasi Window Absen — Segera Hadir
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pengaturan jam buka/tutup check-in absensi magang akan dikelola di sini.
          Saat ini window check-in masih memakai jam tetap.
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
        <Clock className="size-3.5" strokeWidth={2.4} />
        09.00 – 12.00 WIB (default)
      </span>
    </div>
  );
}
