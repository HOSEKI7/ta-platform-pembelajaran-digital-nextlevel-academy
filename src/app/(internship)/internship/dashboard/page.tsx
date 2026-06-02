import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadDashboardData } from "@/lib/internship-data-loader";

import { InternshipDashboard } from "@/components/internship/dashboard/internship-dashboard";
import { InternshipEmptyState } from "@/components/internship/internship-empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Magang",
  description: "Pengingat absen, status absensi hari ini, dan tugas yang menunggu.",
  robots: { index: false, follow: false },
};

export default async function InternshipDashboardPage() {
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/dashboard",
  });
  const firstName = session.user.name.split(" ")[0] ?? session.user.name;
  const displayName = session.user.username?.trim() || firstName;

  // Capture "now" on the server so the live clock's first client render matches.
  const serverNowISO = new Date().toISOString();

  const data = await loadDashboardData(session.user.id);
  if (!data) {
    return (
      <InternshipEmptyState eyebrow="Magang · Dashboard" title="Ringkasan" accent="Magang" />
    );
  }

  return (
    <InternshipDashboard
      firstName={displayName}
      serverNowISO={serverNowISO}
      context={data.context}
      window={data.window}
      todayStatus={data.todayStatus}
      todayCheckInLabel={data.todayCheckInLabel}
      todayCheckable={data.todayCheckable}
      monthSummary={data.monthSummary}
      last7={data.last7}
      tasks={data.tasks}
    />
  );
}
