import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorStudents } from "@/lib/mentor-data-loader";

import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";
import { MentorStudentsTable } from "@/components/mentor/students/mentor-students-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Peserta · Mentor",
  description:
    "Daftar peserta magang di kelas bimbingan: nama dan asal universitas.",
  robots: { index: false, follow: false },
};

export default async function MentorStudentsPage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/students",
  });

  const data = await loadMentorStudents(session.user.id);
  if (!data) {
    return (
      <MentorEmptyState
        eyebrow="Mentor · Daftar Peserta"
        title="Daftar"
        accent="Peserta"
      />
    );
  }

  return <MentorStudentsTable data={data} />;
}
