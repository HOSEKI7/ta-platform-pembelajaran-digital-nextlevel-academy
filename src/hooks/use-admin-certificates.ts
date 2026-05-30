"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type AdminCertificatesParams,
  type AdminCertificatesResult,
  adminCertificatesKey,
} from "@/lib/admin-certificates-query";

async function fetchAdminCertificates(
  params: AdminCertificatesParams,
): Promise<AdminCertificatesResult> {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set("page", String(params.page));
  if (params.status !== "all") sp.set("status", params.status);
  if (params.sort !== "issued_desc") sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);
  if (params.courseId) sp.set("courseId", params.courseId);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/certificates${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Gagal memuat daftar sertifikat (${res.status})`);
  }
  const json = (await res.json()) as { data: AdminCertificatesResult };
  return json.data;
}

export function useAdminCertificatesQuery(params: AdminCertificatesParams) {
  return useQuery({
    queryKey: adminCertificatesKey(params),
    queryFn: () => fetchAdminCertificates(params),
    placeholderData: (prev) => prev,
  });
}
