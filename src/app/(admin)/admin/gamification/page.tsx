import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import {
  listBadgeCourseOptions,
  loadAdminBadgesPage,
} from "@/lib/admin-badges-loader";
import {
  type AdminBadgesParams,
  adminBadgesKey,
  parsePage,
  parseSearch,
  parseTrigger,
} from "@/lib/admin-badges-query";
import { loadBadgeIconOptions } from "@/lib/badge-icons";

import { GamificationView } from "@/components/admin/gamification/gamification-view";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Gamifikasi",
  description:
    "Lihat aturan EXP & level dan kelola badge penghargaan peserta didik.",
  robots: { index: false, follow: false },
};

type SP = {
  tab?: string;
  page?: string;
  search?: string;
  trigger?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminGamificationPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/gamification" });

  const sp = await searchParams;
  const params: AdminBadgesParams = {
    page: parsePage(sp.page),
    search: parseSearch(sp.search),
    trigger: parseTrigger(sp.trigger),
  };

  const queryClient = getQueryClient();
  const [courseOptions, iconPresets] = await Promise.all([
    listBadgeCourseOptions(),
    Promise.resolve(loadBadgeIconOptions()),
    queryClient.prefetchQuery({
      queryKey: adminBadgesKey(params),
      queryFn: () => loadAdminBadgesPage(params),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentPageContainer width="wide">
        <GamificationView
          courseOptions={courseOptions}
          iconPresets={iconPresets}
        />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
