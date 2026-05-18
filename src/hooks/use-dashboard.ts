"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  DashboardStatsDTO,
  RecommendedCourseDTO,
  StudentCourseCardDTO,
} from "@/lib/student-data-loader";
import { studentKeys } from "@/lib/student-query-keys";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gagal memuat data (${res.status})`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: studentKeys.dashboard.stats(),
    queryFn: () => getJson<DashboardStatsDTO>("/api/student/dashboard/stats"),
    staleTime: 60 * 1000,
  });
}

export function useInProgressCoursesQuery() {
  return useQuery({
    queryKey: studentKeys.dashboard.inProgress(),
    queryFn: () =>
      getJson<{ courses: StudentCourseCardDTO[] }>(
        "/api/student/dashboard/in-progress",
      ),
    staleTime: 60 * 1000,
  });
}

export function useRecommendedCoursesQuery() {
  return useQuery({
    queryKey: studentKeys.dashboard.recommendations(),
    queryFn: () =>
      getJson<{ courses: RecommendedCourseDTO[] }>(
        "/api/student/dashboard/recommendations",
      ),
    staleTime: 60 * 1000,
  });
}
