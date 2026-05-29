import type { Metadata } from "next";

import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import { loadMentorContext } from "@/lib/mentor-data-loader";
import { wibTodayISO } from "@/components/mentor/attendance/attendance-format";

import { MentorEmptyState } from "@/components/mentor/mentor-empty-state";
import { CreateTaskView } from "@/components/mentor/tasks/create/create-task-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Tugas Baru · Mentor",
  description: "Buat tugas baru untuk peserta magang di kelas bimbingan.",
  robots: { index: false, follow: false },
};

export default async function MentorCreateTaskPage() {
  const session = await requireRole(Role.MENTOR, {
    redirectTo: "/mentor/tasks/new",
  });

  const ctx = await loadMentorContext(session.user.id);
  if (!ctx) {
    return (
      <MentorEmptyState eyebrow="Mentor · Tugas" title="Buat" accent="Tugas" />
    );
  }

  const todayISO = wibTodayISO(new Date().toISOString());

  return (
    <CreateTaskView
      classFullName={ctx.context.classFullName}
      minISO={todayISO}
      maxISO={ctx.period.endISO}
    />
  );
}
