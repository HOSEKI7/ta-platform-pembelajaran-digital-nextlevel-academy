"use client";

import { useMutation } from "@tanstack/react-query";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

export type UploadedBadgeIcon = {
  /** Bunny object path persisted to `Badge.logoUrl`. */
  path: string;
  /** Freshly signed URL for immediate preview. */
  url: string;
};

/** Upload a custom badge icon to Bunny Storage. */
export function useBadgeIconUploadMutation() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadedBadgeIcon> => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/badges/icons", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Gagal mengunggah ikon badge."));
      }
      const json = (await res.json()) as { data: UploadedBadgeIcon };
      return json.data;
    },
  });
}
