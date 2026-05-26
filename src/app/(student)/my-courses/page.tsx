import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadMyCourses } from "@/lib/student-data-loader";
import { studentKeys } from "@/lib/student-query-keys";

import { MyCoursesView } from "@/components/dashboard/my-courses/my-courses-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kursus Saya",
  description: "Daftar kursus yang kamu miliki di NextLevel Academy.",
  robots: { index: false, follow: false },
};

export default async function MyCoursesPage() {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/my-courses",
  });
  const userId = session.user.id;

  const defaultFilters = { search: "", status: "all" as const };
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: studentKeys.myCourses(defaultFilters),
    queryFn: () => loadMyCourses(userId, defaultFilters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer>
        <MyCoursesView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
