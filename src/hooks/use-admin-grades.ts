"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ADMIN_GRADES_ROOT_KEY,
  adminGradesKey,
  type AdminGradeListParams,
  type AdminGradeListResult,
} from "@/lib/admin-internship-grades-query";

function buildQuery(params: AdminGradeListParams): string {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.batchId) sp.set("batch", params.batchId);
  if (params.fieldId) sp.set("field", params.fieldId);
  if (params.classId) sp.set("class", params.classId);
  if (params.page > 1) sp.set("page", String(params.page));
  return sp.toString();
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

async function fetchGrades(
  params: AdminGradeListParams,
): Promise<AdminGradeListResult> {
  const qs = buildQuery(params);
  const res = await fetch(`/api/admin/internship/grades${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res, `Gagal memuat nilai (${res.status})`));
  const body = (await res.json()) as { data: AdminGradeListResult };
  return body.data;
}

export function useAdminGradesQuery(
  params: AdminGradeListParams,
  initialData?: AdminGradeListResult,
) {
  return useQuery({
    queryKey: adminGradesKey(params),
    queryFn: () => fetchGrades(params),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export type UpsertAdminGradePayload = {
  grade: number;
  note: string | null;
  reason: string;
};

/** Assign or update an intern's final grade as an admin override. */
export function useAdminUpsertGradeMutation(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertAdminGradePayload) => {
      const res = await fetch(`/api/admin/internship/grades/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await parseError(res, "Gagal menyimpan nilai."));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_GRADES_ROOT_KEY }),
  });
}
