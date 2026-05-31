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

import { BadgeManagementView } from "@/components/admin/gamification/badge-management-view";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Badge",
  description: "Kelola badge penghargaan peserta didik (CRUD).",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  search?: string;
  trigger?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminBadgesPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, {
    redirectTo: "/admin/gamification/badges",
  });

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
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="Admin · Gamifikasi"
            title="Manajemen Badge"
            accent="Penghargaan"
            description="Kelola badge penghargaan peserta didik — buat, ubah, dan hapus badge beserta ikonnya."
          />
          <BadgeManagementView
            courseOptions={courseOptions}
            iconPresets={iconPresets}
          />
        </div>
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
