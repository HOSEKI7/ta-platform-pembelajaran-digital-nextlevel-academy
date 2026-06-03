"use client";

import { NotificationsBell } from "@/components/notifications/notifications-bell";
import {
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
} from "@/hooks/use-notifications";

/** Peserta Didik notifications bell — wires the student feed into the shared bell. */
export function NotificationsButton() {
  const { data, isPending, isError } = useNotificationsQuery();
  const markAllRead = useMarkAllNotificationsReadMutation();

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
