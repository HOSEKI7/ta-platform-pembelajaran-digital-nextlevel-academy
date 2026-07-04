import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import {
  loadDashboardStats,
  loadInProgressCourses,
  loadRecommendedCourses,
} from "@/lib/student-data-loader";
import { studentKeys } from "@/lib/student-query-keys";

import { DashboardGreeting } from "@/components/dashboard/overview/dashboard-greeting";
import { InProgressSection } from "@/components/dashboard/overview/in-progress-section";
import { RecommendationsSection } from "@/components/dashboard/overview/recommendations-section";
import { StatsRow } from "@/components/dashboard/overview/stats-row";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan belajar, EXP, dan rekomendasi kursus untukmu.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/dashboard",
  });
  const userId = session.user.id;
  const firstName = session.user.name.split(" ")[0] ?? session.user.name;
  const displayName = session.user.username?.trim() || firstName;

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: studentKeys.dashboard.stats(),
      queryFn: () => loadDashboardStats(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: studentKeys.dashboard.inProgress(),
      queryFn: () => loadInProgressCourses(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: studentKeys.dashboard.recommendations(),
      queryFn: () => loadRecommendedCourses(userId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer>
        <DashboardGreeting firstName={displayName} />
        <StatsRow />
        <InProgressSection />
        <RecommendationsSection />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
