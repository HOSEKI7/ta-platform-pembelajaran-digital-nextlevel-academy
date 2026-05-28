import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadTaskList } from "@/lib/internship-task-loader";

import { InternshipEmptyState } from "@/components/internship/internship-empty-state";
import { TasksView } from "@/components/internship/tasks/tasks-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tugas Magang",
  description: "Daftar tugas dari mentor: yang akan datang dan yang telah lewat.",
  robots: { index: false, follow: false },
};

export default async function InternshipTasksPage() {
  const session = await requireRole(Role.PESERTA_MAGANG, {
    redirectTo: "/internship/dashboard",
  });

  const tasks = await loadTaskList(session.user.id);
  if (!tasks) {
    return (
      <InternshipEmptyState eyebrow="Magang · Tugas" title="Daftar" accent="Tugas" />
    );
  }

  // Capture "now" on the server so deadline math is deterministic on hydration.
  const serverNowISO = new Date().toISOString();

  return <TasksView tasks={tasks} serverNowISO={serverNowISO} />;
}
