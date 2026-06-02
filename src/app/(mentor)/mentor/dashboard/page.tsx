import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { INTERNSHIP_CHECKIN_WINDOW } from "@/lib/internship-config";
import { loadMentorDashboard } from "@/lib/mentor-data-loader";

import { MentorDashboard } from "@/components/mentor/dashboard/mentor-dashboard";
import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Mentor",
  description:
    "Ringkasan kelas bimbingan: jumlah peserta, kehadiran hari ini, dan tugas yang sedang aktif.",
  robots: { index: false, follow: false },
};

export default async function MentorDashboardPage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/dashboard",
  });
  const firstName = session.user.name.split(" ")[0] ?? session.user.name;
  const displayName = session.user.username?.trim() || firstName;

  // Capture "now" on the server so the live clock's first client render matches.
  const serverNowISO = new Date().toISOString();

  const data = await loadMentorDashboard(session.user.id);
  if (!data) {
    return (
      <MentorEmptyState eyebrow="Mentor · Dashboard" title="Ringkasan" accent="Mentor" />
    );
  }

  return (
    <MentorDashboard
      firstName={displayName}
      serverNowISO={serverNowISO}
      window={INTERNSHIP_CHECKIN_WINDOW}
      data={data}
    />
  );
}
