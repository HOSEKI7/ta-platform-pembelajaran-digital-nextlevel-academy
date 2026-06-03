"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminNavIndicators,
  AdminNavScope,
} from "@/lib/admin-nav-indicators";

const indicatorsKey = ["admin", "nav-indicators"] as const;

async function fetchIndicators(): Promise<AdminNavIndicators> {
  const res = await fetch("/api/admin/notifications/indicators", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gagal memuat indikator (${res.status})`);
  const json = (await res.json()) as { data: AdminNavIndicators };
  return json.data;
}

export function useAdminNavIndicatorsQuery() {
  return useQuery({
    queryKey: indicatorsKey,
    queryFn: fetchIndicators,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

async function markSeen(scope: AdminNavScope): Promise<void> {
  await fetch("/api/admin/notifications/indicators/seen", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ scope }),
  });
}

export function useMarkAdminNavSeenMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markSeen,
    onMutate: (scope: AdminNavScope) => {
      // Optimistically clear the dot so it disappears the instant the page opens.
      qc.setQueryData<AdminNavIndicators>(indicatorsKey, (prev) =>
        prev ? { ...prev, [scope]: false } : prev,
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: indicatorsKey });
    },
  });
}
