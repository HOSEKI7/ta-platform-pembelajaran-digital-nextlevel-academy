import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorTaskDetail } from "@/lib/mentor-data-loader";

import { MentorTaskDetailView } from "@/components/mentor/tasks/detail/mentor-task-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Tugas · Mentor",
  description: "Detail tugas dan pengumpulan peserta di kelas bimbingan.",
  robots: { index: false, follow: false },
};

export default async function MentorTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const session = await requireRole(Role.MENTOR, { redirectTo: "/mentor/tasks" });
  const { taskId } = await params;

  const data = await loadMentorTaskDetail(session.user.id, taskId);
  if (!data) notFound();

  return <MentorTaskDetailView data={data} />;
}
