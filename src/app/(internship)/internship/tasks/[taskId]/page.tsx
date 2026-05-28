import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadTaskDetail } from "@/lib/internship-task-loader";

import { TaskDetailView } from "@/components/internship/tasks/task-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Tugas Magang",
  description: "Detail tugas, instruksi, lampiran, dan pengumpulan hasil kerja.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ taskId: string }> };

export default async function InternshipTaskDetailPage({ params }: Props) {
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/dashboard",
  });

  const { taskId } = await params;
  const task = await loadTaskDetail(session.user.id, taskId);
  if (!task) {
    notFound();
  }

  const serverNowISO = new Date().toISOString();
  return <TaskDetailView task={task} serverNowISO={serverNowISO} />;
}
