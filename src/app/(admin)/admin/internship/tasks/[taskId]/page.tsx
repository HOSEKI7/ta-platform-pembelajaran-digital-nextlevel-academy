import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadAdminTaskDetail } from "@/lib/admin-internship-tasks-loader";

import { AdminTaskDetailView } from "@/components/admin/internship/tasks/detail/admin-task-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Tugas Magang · Admin",
  description: "Detail tugas magang dan pengumpulan peserta di kelasnya.",
  robots: { index: false, follow: false },
};

export default async function AdminInternshipTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  await requireRole(Role.ADMINISTRATOR, { redirectTo: "/admin/internship/tasks" });
  const { taskId } = await params;

  const data = await loadAdminTaskDetail(taskId);
  if (!data) notFound();

  return <AdminTaskDetailView data={data} />;
}
