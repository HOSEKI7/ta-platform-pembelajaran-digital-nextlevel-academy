"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  adminAttendanceKey,
  attendanceFiltersKey,
  type AdminAttendanceParams,
  type AdminAttendanceResult,
  type AttendanceFilterOptions,
  type AttendanceScope,
  type SettableStatus,
} from "@/lib/admin-internship-attendance-query";

function buildQuery(params: AdminAttendanceParams): string {
  const sp = new URLSearchParams();
  sp.set("scope", params.scope);
  sp.set("date", params.dateISO);
  if (params.batchId) sp.set("batch", params.batchId);
  if (params.fieldId) sp.set("field", params.fieldId);
  if (params.classId) sp.set("class", params.classId);
  if (params.search) sp.set("search", params.search);
  if (params.page > 1) sp.set("page", String(params.page));
  return sp.toString();
}

async function fetchAttendance(
  params: AdminAttendanceParams,
): Promise<AdminAttendanceResult> {
  const res = await fetch(
    `/api/admin/internship/attendance?${buildQuery(params)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Gagal memuat absensi (${res.status})`);
  }
  const body = (await res.json()) as { data: AdminAttendanceResult };
  return body.data;
}

export function useAdminAttendanceQuery(
  params: AdminAttendanceParams,
  initialData?: AdminAttendanceResult,
) {
  return useQuery({
    queryKey: adminAttendanceKey(params),
    queryFn: () => fetchAttendance(params),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

async function fetchFilters(): Promise<AttendanceFilterOptions> {
  const res = await fetch("/api/admin/internship/attendance/filters", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Gagal memuat filter (${res.status})`);
  }
  const body = (await res.json()) as { data: AttendanceFilterOptions };
  return body.data;
}

export function useAttendanceFiltersQuery(initialData?: AttendanceFilterOptions) {
  return useQuery({
    queryKey: attendanceFiltersKey,
    queryFn: fetchFilters,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

type SetAttendanceVars = {
  scope: AttendanceScope;
  userId: string;
  dateISO: string;
  status: SettableStatus;
};

async function patchAttendance(vars: SetAttendanceVars): Promise<void> {
  const res = await fetch("/api/admin/internship/attendance", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      scope: vars.scope,
      userId: vars.userId,
      date: vars.dateISO,
      status: vars.status,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Gagal menyimpan absensi (${res.status})`);
  }
}

/**
 * Override one person's attendance. On success the whole attendance list is
 * invalidated so the derived status + check-in time re-render from the server.
 */
export function useSetAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "internship-attendance"],
      });
    },
  });
}
