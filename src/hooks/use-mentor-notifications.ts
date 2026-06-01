"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { NotificationsDTO } from "@/lib/student-data-loader";
import { mentorKeys } from "@/lib/mentor-query-keys";

async function fetchNotifications(): Promise<NotificationsDTO> {
  const res = await fetch("/api/mentor/notifications", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gagal memuat notifikasi (${res.status})`);
  const json = (await res.json()) as { data: NotificationsDTO };
  return json.data;
}

export function useMentorNotificationsQuery() {
  return useQuery({
    queryKey: mentorKeys.notifications(),
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
  });
}

async function markAllRead(): Promise<{ updatedCount: number }> {
  const res = await fetch("/api/mentor/notifications/mark-all-read", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gagal menandai notifikasi (${res.status})`);
  const json = (await res.json()) as { data: { updatedCount: number } };
  return json.data;
}

export function useMarkAllMentorNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onMutate: () => {
      // Optimistic: zero the unreadCount immediately so the bell badge clears
      // the moment the popover opens.
      qc.setQueryData<NotificationsDTO>(mentorKeys.notifications(), (prev) =>
        prev
          ? {
              unreadCount: 0,
              items: prev.items.map((i) => ({ ...i, isRead: true })),
            }
          : prev,
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: mentorKeys.notifications() });
    },
  });
}
