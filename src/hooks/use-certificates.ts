"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CertificatesPageDTO } from "@/lib/certificate-data-loader";
import { studentKeys } from "@/lib/student-query-keys";
import type {
  CertificatesPageSize,
  CertificatesSort,
} from "@/lib/validators/certificates";

export type CertificatesFiltersInput = {
  sort: CertificatesSort;
  pageSize: CertificatesPageSize;
  page: number;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Gagal memuat data (${res.status})`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      /* ignore parse error */
    }
    throw new Error(message);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Permintaan gagal (${res.status})`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      /* ignore parse error */
    }
    throw new Error(message);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function useCertificatesQuery(filters: CertificatesFiltersInput) {
  const qs = new URLSearchParams({
    sort: filters.sort,
    pageSize: String(filters.pageSize),
    page: String(filters.page),
  }).toString();
  return useQuery({
    queryKey: studentKeys.certificates(filters),
    queryFn: () =>
      getJson<CertificatesPageDTO>(`/api/student/certificates?${qs}`),
    staleTime: 30 * 1000,
  });
}

export type ClaimCertificateResult = {
  certificate: {
    id: string;
    certificateNo: string;
    issuedAt: string;
    expiresAt: string | null;
  };
};

export function useClaimCertificateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { courseId: string }) =>
      postJson<ClaimCertificateResult>(
        "/api/student/certificates/claim",
        input,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.certificates() });
      queryClient.invalidateQueries({
        queryKey: studentKeys.dashboard.stats(),
      });
    },
  });
}
