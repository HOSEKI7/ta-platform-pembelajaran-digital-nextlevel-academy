import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorTasks } from "@/lib/mentor-data-loader";

import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";
import { MentorTasksView } from "@/components/mentor/tasks/mentor-tasks-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Tugas · Mentor",
  description:
    "Kelola tugas magang di kelas bimbingan: pantau progres pengumpulan tiap tugas.",
  robots: { index: false, follow: false },
};

export default async function MentorTasksPage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/tasks",
  });

  const data = await loadMentorTasks(session.user.id);
  if (!data) {
    return (
      <MentorEmptyState eyebrow="Mentor · Tugas" title="Kelola" accent="Tugas" />
    );
  }

  return <MentorTasksView data={data} />;
}
