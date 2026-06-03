import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import { loadAdminUsersPage } from "@/lib/admin-users-loader";
import {
  type AdminUsersParams,
  adminUsersKey,
  parsePage,
  parseRole,
  parseSearch,
  parseSort,
  parseStatus,
} from "@/lib/admin-users-query";

import { AdminUsersView } from "@/components/admin/users/admin-users-view";
import { AdminNavSeenMarker } from "@/components/admin/admin-nav-seen-marker";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Pengguna",
  description:
    "Kelola seluruh akun platform — buat, sunting, nonaktifkan, atau hapus.",
  robots: { index: false, follow: false },
};

type SP = {
  page?: string;
  role?: string;
  status?: string;
  search?: string;
  sort?: string;
};

type Props = { searchParams: Promise<SP> };

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/users" });

  const sp = await searchParams;
  const params: AdminUsersParams = {
    page: parsePage(sp.page),
    role: parseRole(sp.role),
    status: parseStatus(sp.status),
    search: parseSearch(sp.search),
    sort: parseSort(sp.sort),
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: adminUsersKey(params),
    queryFn: () => loadAdminUsersPage(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminNavSeenMarker scope="users" />
      <StudentPageContainer width="wide">
        <AdminUsersView />
      </StudentPageContainer>
    </HydrationBoundary>
  );
}
