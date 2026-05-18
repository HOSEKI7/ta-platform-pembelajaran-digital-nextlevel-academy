"use client";

import { useQuery } from "@tanstack/react-query";

import type { GameProfileDTO } from "@/lib/student-data-loader";
import { studentKeys } from "@/lib/student-query-keys";

async function fetchGameProfile(): Promise<GameProfileDTO> {
  const res = await fetch("/api/student/me/game-profile", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gagal memuat level (${res.status})`);
  const json = (await res.json()) as { data: GameProfileDTO };
  return json.data;
}

export function useGameProfileQuery() {
  return useQuery({
    queryKey: studentKeys.gameProfile(),
    queryFn: fetchGameProfile,
    staleTime: 30 * 1000,
  });
}
