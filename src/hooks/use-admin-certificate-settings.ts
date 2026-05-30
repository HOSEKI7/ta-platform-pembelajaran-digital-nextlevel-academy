"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CertExpirySettingInput } from "@/lib/validations/admin-certificate";

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

/**
 * Updates the global certificate-expiry setting. Invalidates the certificate
 * list (status badges depend on expiry) and refreshes server props so the
 * prefilled form value stays in sync.
 */
export function useUpdateCertExpiryMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: CertExpirySettingInput) => {
      const res = await fetch("/api/admin/certificates/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error(
          await parseError(res, "Gagal menyimpan pengaturan sertifikat."),
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "certificates"] });
      router.refresh();
    },
  });
}
