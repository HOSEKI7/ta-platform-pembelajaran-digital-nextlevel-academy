"use client";

import { NotificationsBell } from "@/components/notifications/notifications-bell";
import {
  useInternshipNotificationsQuery,
  useMarkAllInternshipNotificationsReadMutation,
} from "@/hooks/use-internship-notifications";

/**
 * Peserta-Magang notifications bell — DB-backed feed wired into the shared bell.
 * Surfaces TASK_ASSIGNED (new task), TASK_FEEDBACK (returned task), and
 * FINAL_GRADE_POSTED (mentor filled the final grade) — see PRD §6.12.
 */
export function InternshipNotificationsButton() {
  const { data, isPending, isError } = useInternshipNotificationsQuery();
  const markAllRead = useMarkAllInternshipNotificationsReadMutation();

  return (
    <NotificationsBell
      data={data}
      isPending={isPending}
      isError={isError}
      onOpenedWithUnread={() => {
        if (!markAllRead.isPending) markAllRead.mutate();
      }}
    />
  );
}
