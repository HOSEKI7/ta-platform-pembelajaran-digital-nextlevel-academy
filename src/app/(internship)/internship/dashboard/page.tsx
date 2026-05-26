import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { InternshipDashboard } from "@/components/internship/dashboard/internship-dashboard";
import {
  MOCK_ATTENDANCE_WINDOW,
  MOCK_LAST7,
  MOCK_MAGANG_CONTEXT,
  MOCK_MONTH_SUMMARY,
  buildMockPendingTasks,
} from "@/components/internship/dashboard/mock-data";

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

  // Capture "now" on the server so the live clock's first client render matches
  // and task urgency stays deterministic across hydration. Mock data only —
  // real loaders replace this in a later backend pass.
  const now = new Date();
  const serverNowISO = now.toISOString();
  const tasks = buildMockPendingTasks(now);

  return (
    <InternshipDashboard
      firstName={firstName}
      serverNowISO={serverNowISO}
      context={MOCK_MAGANG_CONTEXT}
      window={MOCK_ATTENDANCE_WINDOW}
      monthSummary={MOCK_MONTH_SUMMARY}
      last7={MOCK_LAST7}
      tasks={tasks}
    />
  );
}
