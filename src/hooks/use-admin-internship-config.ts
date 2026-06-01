"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type InternshipConfigData,
  internshipConfigKey,
} from "@/lib/admin-internship-config-query";

async function fetchInternshipConfig(): Promise<InternshipConfigData> {
  const res = await fetch("/api/admin/internship/config", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat konfigurasi magang (${res.status})`);
  }
  const json = (await res.json()) as { data: InternshipConfigData };
  return json.data;
}

export function useInternshipConfigQuery() {
  return useQuery({
    queryKey: internshipConfigKey,
    queryFn: fetchInternshipConfig,
    placeholderData: (prev) => prev,
  });
}
