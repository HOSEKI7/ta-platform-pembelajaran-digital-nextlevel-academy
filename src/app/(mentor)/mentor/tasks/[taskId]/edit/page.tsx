import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorTaskForEdit } from "@/lib/mentor-data-loader";
import { wibTodayISO } from "@/components/mentor/student-attendance/attendance-format";

import { EditTaskView } from "@/components/mentor/tasks/edit/edit-task-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Tugas · Mentor",
  description: "Perbarui detail tugas di kelas bimbingan.",
  robots: { index: false, follow: false },
};

export default async function MentorTaskEditPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const session = await requireRole(Role.MENTOR, { redirectTo: "/mentor/tasks" });
  const { taskId } = await params;

  const data = await loadMentorTaskForEdit(session.user.id, taskId);
  if (!data) notFound();

  const todayISO = wibTodayISO(new Date().toISOString());

  return <EditTaskView data={data} minISO={todayISO} maxISO={data.period.endISO} />;
}
