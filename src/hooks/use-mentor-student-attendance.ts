"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { mentorKeys } from "@/lib/mentor-query-keys";
import type { MentorAttendanceData } from "@/lib/mentor-types";

async function fetchAttendance(dateISO: string): Promise<MentorAttendanceData> {
  const res = await fetch(`/api/mentor/student-attendance?date=${dateISO}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Gagal memuat absensi (${res.status})`);
  }
  const body = (await res.json()) as { data: MentorAttendanceData };
  return body.data;
}

/**
 * Class attendance for a selected date. `initialData` seeds the SSR date only;
 * other dates fetch on demand and stay cached (staleTime) so re-visiting a date
 * doesn't re-hit the server.
 */
export function useMentorStudentAttendanceQuery(
  dateISO: string,
  initialData?: MentorAttendanceData,
) {
  return useQuery({
    queryKey: mentorKeys.studentAttendanceByDate(dateISO),
    queryFn: () => fetchAttendance(dateISO),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
