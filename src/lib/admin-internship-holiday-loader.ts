import "server-only";

import { getWibYmd } from "@/components/internship/attendance/attendance-data";
import { prisma } from "@/lib/prisma";
import type {
  HolidayConfigData,
  HolidayRow,
} from "@/lib/admin-internship-holiday-query";

/**
 * Data loader for the admin "Konfigurasi Jam Kerja dan Libur" surface — the
 * Tanggal Libur (Holiday) tab (PRD §6.9 / §5.3). Server-only. The list is small
 * so we fetch it whole and let the view sort/derive state client-side. `todayISO`
 * is computed server-side in WIB so SSR and the first client render agree
 * (hydration-safe) and the state machine never depends on the client clock.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** `@db.Date` columns are stored as UTC midnight → format back as "YYYY-MM-DD". */
function dbDateToISO(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export async function loadHolidayConfig(): Promise<HolidayConfigData> {
  const holidays = await prisma.holiday.findMany({
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      description: true,
      startDate: true,
      endDate: true,
      days: true,
      createdAt: true,
    },
  });

  const rows: HolidayRow[] = holidays.map((h) => ({
    id: h.id,
    description: h.description,
    startDate: dbDateToISO(h.startDate),
    endDate: dbDateToISO(h.endDate),
    days: h.days,
    createdAt: h.createdAt.toISOString(),
  }));

  const t = getWibYmd(new Date().toISOString());
  const todayISO = `${t.year}-${pad(t.month + 1)}-${pad(t.day)}`;

  return { holidays: rows, todayISO };
}
