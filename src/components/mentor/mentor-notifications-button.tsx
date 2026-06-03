"use client";

import { NotificationsBell } from "@/components/notifications/notifications-bell";
import {
  useMarkAllMentorNotificationsReadMutation,
  useMentorNotificationsQuery,
} from "@/hooks/use-mentor-notifications";

/**
 * Mentor notifications bell — DB-backed feed (TASK_SUBMITTED, FINAL_GRADE_OVERRIDE)
 * wired into the shared bell (PRD §6.10.1 / §6.11.9).
 */
export function MentorNotificationsButton() {
  const { data, isPending, isError } = useMentorNotificationsQuery();
  const markAllRead = useMarkAllMentorNotificationsReadMutation();

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
