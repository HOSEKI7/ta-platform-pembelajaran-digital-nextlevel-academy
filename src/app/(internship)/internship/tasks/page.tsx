import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";

import { TasksView } from "@/components/internship/tasks/tasks-view";
import { MOCK_TASKS } from "@/components/internship/tasks/tasks-mock-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tugas Magang",
  description: "Daftar tugas dari mentor: yang akan datang dan yang telah lewat.",
  robots: { index: false, follow: false },
};

export default async function InternshipTasksPage() {
  await requireRole(Role.PESERTA_MAGANG, { redirectTo: "/internship/dashboard" });

  // Capture "now" on the server so deadline math is deterministic on hydration.
  const serverNowISO = new Date().toISOString();

  // UI-only design pass: tasks come from client-safe mock data (see PRD §6.9.3).
  return <TasksView tasks={MOCK_TASKS} serverNowISO={serverNowISO} />;
}
