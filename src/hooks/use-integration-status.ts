"use client";

import { useQuery } from "@tanstack/react-query";

import type { IntegrationCheck } from "@/lib/admin-integration-status";

async function fetchIntegrationStatus(): Promise<IntegrationCheck[]> {
  const res = await fetch("/api/admin/settings/integration-status", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memeriksa status integrasi (${res.status}).`);
  }
  const json = (await res.json()) as { data: IntegrationCheck[] };
  return json.data;
}

export const integrationStatusKey = ["admin", "integration-status"] as const;

export function useIntegrationStatusQuery() {
  return useQuery({
    queryKey: integrationStatusKey,
    queryFn: fetchIntegrationStatus,
    // Live probes are mildly expensive; keep results fresh for a minute and
    // let the explicit "Periksa Ulang" button drive refetches.
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
