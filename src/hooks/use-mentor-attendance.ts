"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { MentorAttendanceData } from "@/lib/mentor-types";

/** Query-key factory for all mentor-scoped client queries. */
export const mentorKeys = {
  all: ["mentor"] as const,
  attendanceByDate: (dateISO: string) =>
    [...mentorKeys.all, "attendance", dateISO] as const,
};

async function fetchAttendance(dateISO: string): Promise<MentorAttendanceData> {
  const res = await fetch(`/api/mentor/attendance?date=${dateISO}`, {
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
export function useMentorAttendanceQuery(
  dateISO: string,
  initialData?: MentorAttendanceData,
) {
  return useQuery({
    queryKey: mentorKeys.attendanceByDate(dateISO),
    queryFn: () => fetchAttendance(dateISO),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
