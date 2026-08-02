import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { getQueryClient } from "@/lib/query-client";
import {
  loadGameProfile,
  loadNotifications,
} from "@/lib/student-data-loader";
import { studentKeys } from "@/lib/student-query-keys";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import "./student.css";

const COLLAPSED_COOKIE = "student-sidebar-collapsed";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(Role.PESERTA_DIDIK, {
    redirectTo: "/dashboard",
  });

  if (session.user.mustChangePassword) {
    redirect("/ganti-password");
  }

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get(COLLAPSED_COOKIE)?.value === "1";

  // Prefetch at layout level so LevelChip (gameProfile) and
  // NotificationsButton always have data on first mount — no hydration flash.
  const userId = session.user.id;
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: studentKeys.gameProfile(),
      queryFn: () => loadGameProfile(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: studentKeys.notifications(),
      queryFn: () => loadNotifications(userId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell
        user={{
          name: session.user.name,
          email: session.user.email,
          username: session.user.username ?? null,
          image: session.user.image ?? null,
        }}
        initialCollapsed={initialCollapsed}
      >
        {children}
      </DashboardShell>
    </HydrationBoundary>
  );
}
