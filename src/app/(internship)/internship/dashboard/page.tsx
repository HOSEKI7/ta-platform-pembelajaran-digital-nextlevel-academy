import type { Metadata } from "next";

import { getSession } from "@/lib/auth-server";
import { loadDashboardData } from "@/lib/internship-data-loader";

import { InternshipDashboard } from "@/components/internship/dashboard/internship-dashboard";
import { InternshipEmptyState } from "@/components/internship/internship-empty-state";

// ponytail: gating is in (internship)/layout.tsx, getSession cheaper than
// requireRole because cookieCache may have the data already.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Magang",
  description: "Pengingat absen, status absensi hari ini, dan tugas yang menunggu.",
  robots: { index: false, follow: false },
};

export default async function InternshipDashboardPage() {
  const session = await getSession();
  // layout.tsx already gated PESERTA_MAGANG — session is guaranteed.
  if (!session) return null;
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
      todayOff={data.todayOff}
      monthSummary={data.monthSummary}
      last7={data.last7}
      tasks={data.tasks}
    />
  );
}
