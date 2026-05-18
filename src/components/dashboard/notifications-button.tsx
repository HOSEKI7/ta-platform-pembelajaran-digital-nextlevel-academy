"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, CheckCircle2, Inbox } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { NotificationDTO } from "@/lib/student-data-loader";
import {
  useMarkAllNotificationsReadMutation,
  useNotificationsQuery,
} from "@/hooks/use-notifications";

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError } = useNotificationsQuery();
  const markAllRead = useMarkAllNotificationsReadMutation();

  // Fire mark-all-read once on every open, but only if there are unread items.
  useEffect(() => {
    if (open && (data?.unreadCount ?? 0) > 0 && !markAllRead.isPending) {
      markAllRead.mutate();
    }
    // markAllRead is stable from useMutation; intentionally not in deps to avoid
    // refire after the optimistic update flips unreadCount to 0.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={
          unread > 0
            ? `Notifikasi (${unread} belum dibaca)`
            : "Notifikasi"
        }
        className={cn(
          "relative inline-flex size-10 items-center justify-center rounded-full ring-1 ring-zinc-200 transition",
          "hover:ring-[color:var(--color-brand-300)] hover:bg-[color:var(--color-brand-50)]",
          "dark:ring-[color:var(--color-surface-border)] dark:hover:bg-white/5 dark:hover:ring-[color:var(--color-surface-border-strong)]",
        )}
      >
        {unread > 0 ? (
          <BellRing className="size-4 text-zinc-700 dark:text-zinc-200" strokeWidth={2.2} />
        ) : (
          <Bell className="size-4 text-zinc-700 dark:text-zinc-200" strokeWidth={2.2} />
        )}
        {unread > 0 ? (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-[color:var(--color-error)] px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[color:var(--color-surface-nav)]"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[340px] rounded-2xl border-0 p-0 ring-1 ring-zinc-200 shadow-[0_24px_50px_-20px_rgba(35,65,137,0.35)] dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-[color:var(--color-surface-border)]">
          <div>
            <p className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Notifikasi
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {unread > 0 ? `${unread} baru` : "Semua sudah dibaca"}
            </p>
          </div>
          {items.length > 0 && unread === 0 ? (
            <CheckCircle2 className="size-4 text-[color:var(--color-success)]" />
          ) : null}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isPending ? (
            <ul className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-zinc-100 dark:bg-white/5"
                />
              ))}
            </ul>
          ) : isError ? (
            <p className="px-4 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Gagal memuat notifikasi.
            </p>
          ) : items.length === 0 ? (
            <div className="grid place-items-center gap-2 px-4 py-10 text-center">
              <Inbox className="size-7 text-zinc-300 dark:text-zinc-600" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Belum ada notifikasi.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-[color:var(--color-surface-border)]">
              {items.map((n) => (
                <li key={n.id}>
                  <NotificationRow notification={n} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({ notification: n }: { notification: NotificationDTO }) {
  const body = (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          n.isRead
            ? "bg-zinc-300 dark:bg-zinc-600"
            : "bg-[color:var(--color-brand-500)] shadow-[0_0_8px_var(--color-brand-300)]",
        )}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            n.isRead
              ? "text-zinc-700 dark:text-zinc-300"
              : "text-zinc-900 dark:text-white",
          )}
        >
          {n.title}
        </p>
        <p className="line-clamp-2 mt-0.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
          {n.message}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
          {formatDistanceToNow(parseISO(n.createdAt), {
            addSuffix: true,
            locale: idLocale,
          })}
        </p>
      </div>
    </div>
  );

  const baseClass =
    "block px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-white/[0.04]";

  return <div className={baseClass}>{body}</div>;
}
