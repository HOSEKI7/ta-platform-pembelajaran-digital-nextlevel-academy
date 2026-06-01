import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAdminTaskForEdit } from "@/lib/admin-internship-tasks-loader";
import { wibTodayISO } from "@/components/mentor/student-attendance/attendance-format";

import { AdminEditTaskView } from "@/components/admin/internship/tasks/edit/admin-edit-task-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Tugas Magang · Admin",
  description: "Perbarui detail tugas program magang.",
  robots: { index: false, follow: false },
};

export default async function AdminInternshipTaskEditPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/internship/tasks" });
  const { taskId } = await params;

  const data = await loadAdminTaskForEdit(taskId);
  if (!data) notFound();

  const todayISO = wibTodayISO(new Date().toISOString());

  return <AdminEditTaskView data={data} minISO={todayISO} maxISO={data.period.endISO} />;
}
