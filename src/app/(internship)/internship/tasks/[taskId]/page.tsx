import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { TaskDetailView } from "@/components/internship/tasks/task-detail-view";
import { getTaskById } from "@/components/internship/tasks/tasks-mock-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Tugas Magang",
  description: "Detail tugas, instruksi, lampiran, dan pengumpulan hasil kerja.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ taskId: string }> };

export default async function InternshipTaskDetailPage({ params }: Props) {
  await requireRole(Role.PESERTA_MAGANG, { redirectTo: "/internship/dashboard" });

  const { taskId } = await params;
  // UI-only design pass: look the task up in client-safe mock data (PRD §6.9.3).
  const task = getTaskById(taskId);
  if (!task) {
    notFound();
  }

  const serverNowISO = new Date().toISOString();

  return <TaskDetailView task={task} serverNowISO={serverNowISO} />;
}
