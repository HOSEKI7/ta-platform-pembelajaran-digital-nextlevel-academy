"use client";

import { useMutation } from "@tanstack/react-query";

import type { PlatformInfo } from "@/lib/validations/admin-platform-settings";

async function putPlatformInfo(payload: PlatformInfo): Promise<PlatformInfo> {
  const res = await fetch("/api/admin/settings/platform-info", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const json = (await res.json()) as
    | { data: PlatformInfo; error?: never }
    | { error: string; data?: never };
  if (!res.ok || "error" in json) {
    throw new Error(
      "error" in json ? json.error : `Gagal menyimpan (${res.status}).`,
    );
  }
  return json.data;
}

export function useUpdatePlatformInfoMutation() {
  return useMutation<PlatformInfo, Error, PlatformInfo>({
    mutationFn: putPlatformInfo,
  });
}
