import { History, ShieldCheck, Clock } from "lucide-react";

import { formatDateID, formatTimeID } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { TransactionLogEntry } from "@/lib/admin-transactions-query";

type Props = {
  log: TransactionLogEntry[];
};

/**
 * "Log Transaksi" timeline on the admin detail page: a merged, newest-first feed
 * of order-lifecycle events and recorded admin actions. Lifecycle nodes are
 * neutral; admin actions are highlighted in brand colour.
 */
export function TransactionLogTimeline({ log }: Props) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)] sm:p-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
          <History className="size-[1.125rem]" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Log Transaksi
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Riwayat perubahan status dan tindakan admin
          </p>
        </div>
      </div>

      <ol className="relative flex flex-col gap-5 pl-2">
        {/* connecting rail */}
        <span
          aria-hidden
          className="absolute bottom-2 left-[1.05rem] top-2 w-px bg-zinc-200 dark:bg-white/10"
        />
        {log.map((entry) => {
          const isAdmin = entry.kind === "admin";
          return (
            <li key={entry.id} className="relative flex gap-4">
              <span
                className={cn(
                  "z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-[color:var(--color-surface-card)]",
                  isAdmin
                    ? "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] dark:bg-[color:var(--color-brand-500)]/20 dark:text-[color:var(--color-brand-200)]"
                    : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
                )}
              >
                {isAdmin ? (
                  <ShieldCheck className="size-4" strokeWidth={2.2} />
                ) : (
                  <Clock className="size-4" strokeWidth={2.2} />
                )}
              </span>
              <div className="min-w-0 flex-1 pb-0.5">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {entry.label}
                </p>
                {entry.detail ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {entry.detail}
                    {entry.actorName ? (
                      <>
                        {" · oleh "}
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                          {entry.actorName}
                        </span>
                      </>
                    ) : null}
                  </p>
                ) : entry.actorName ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    oleh{" "}
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      {entry.actorName}
                    </span>
                  </p>
                ) : null}
                <p className="mt-0.5 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                  {formatDateID(entry.at)} · {formatTimeID(entry.at)} WIB
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
