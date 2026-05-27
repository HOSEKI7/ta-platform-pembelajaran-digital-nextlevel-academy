"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { internshipKeys } from "@/lib/internship-query-keys";
import type { AttendanceMonthDTO } from "@/lib/internship-types";

async function fetchMonth(year: number, month: number): Promise<AttendanceMonthDTO> {
  const res = await fetch(`/api/internship/attendance?year=${year}&month=${month}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Gagal memuat absensi (${res.status})`);
  }
  const json = (await res.json()) as { data: AttendanceMonthDTO };
  return json.data;
}

/**
 * Month grid query. `initialData` is the server-prefetched current month, so the
 * first paint has no loading flash; navigating to other months refetches.
 */
export function useAttendanceMonthQuery(
  year: number,
  month: number,
  initialData?: AttendanceMonthDTO,
) {
  return useQuery({
    queryKey: internshipKeys.attendanceMonth(year, month),
    queryFn: () => fetchMonth(year, month),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

type CheckInResponse = { dateISO: string; checkInTime: string };

async function postCheckIn(): Promise<CheckInResponse> {
  const res = await fetch("/api/internship/attendance/check-in", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const body = (await res.json().catch(() => null)) as
    | { data?: CheckInResponse; error?: string }
    | null;
  if (!res.ok || !body?.data) {
    throw new Error(body?.error ?? `Gagal melakukan check-in (${res.status})`);
  }
  return body.data;
}

/**
 * Check-in mutation. On success: refresh every attendance month query and the
 * server-rendered data (dashboard hero / today card) via router.refresh().
 */
export function useCheckInMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: postCheckIn,
    onSuccess: (data) => {
      toast.success("Berhasil check-in", {
        description: `Kamu tercatat hadir pukul ${data.checkInTime} WIB.`,
      });
      qc.invalidateQueries({ queryKey: internshipKeys.all });
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error("Check-in gagal", { description: err.message });
    },
  });
}
