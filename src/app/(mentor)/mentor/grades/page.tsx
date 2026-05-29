import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorGrades } from "@/lib/mentor-data-loader";

import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";
import { MentorGradesTable } from "@/components/mentor/grades/mentor-grades-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nilai Akhir · Mentor",
  description:
    "Beri dan kelola nilai akhir peserta magang di kelas bimbingan.",
  robots: { index: false, follow: false },
};

export default async function MentorGradesPage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/grades",
  });

  const data = await loadMentorGrades(session.user.id);
  if (!data) {
    return (
      <MentorEmptyState
        eyebrow="Mentor · Nilai Akhir"
        title="Nilai"
        accent="Akhir"
      />
    );
  }

  return <MentorGradesTable data={data} />;
}
