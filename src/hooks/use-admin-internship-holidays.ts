"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type HolidayConfigData,
  holidayConfigKey,
} from "@/lib/admin-internship-holiday-query";

async function fetchHolidayConfig(): Promise<HolidayConfigData> {
  const res = await fetch("/api/admin/internship/holidays", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat data libur (${res.status})`);
  }
  const json = (await res.json()) as { data: HolidayConfigData };
  return json.data;
}

export function useHolidayConfigQuery() {
  return useQuery({
    queryKey: holidayConfigKey,
    queryFn: fetchHolidayConfig,
    placeholderData: (prev) => prev,
  });
}
