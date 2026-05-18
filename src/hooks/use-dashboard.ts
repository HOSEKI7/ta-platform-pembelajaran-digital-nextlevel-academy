"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  DashboardStatsDTO,
  MyCoursesFilters,
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

export function useMyCoursesQuery(filters: MyCoursesFilters) {
  const params = new URLSearchParams();
  if (filters.search.length > 0) params.set("search", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  const qs = params.toString();
  const path = qs ? `/api/student/my-courses?${qs}` : "/api/student/my-courses";

  return useQuery({
    queryKey: studentKeys.myCourses(filters),
    queryFn: () => getJson<{ courses: StudentCourseCardDTO[] }>(path),
    staleTime: 60 * 1000,
  });
}
