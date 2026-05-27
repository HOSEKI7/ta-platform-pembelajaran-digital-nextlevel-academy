import { formatInTimeZone } from "date-fns-tz";
import { MessageSquareWarning } from "lucide-react";

import type { MentorFeedback } from "./tasks-mock-data";

const WIB_TZ = "Asia/Jakarta";

type Props = {
  feedback: MentorFeedback;
};

/**
 * Mentor return-feedback callout (PRD §6.9.3 "Alur Pengembalian Tugas"). Only
 * rendered when a task was returned for revision — amber-toned to signal an
 * action is needed without alarming like an error.
 */
export function MentorFeedbackCard({ feedback }: Props) {
  const returnedLabel = formatInTimeZone(
    new Date(feedback.returnedAtISO),
    WIB_TZ,
    "dd/MM/yyyy · HH:mm",
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 dark:border-amber-500/30 dark:bg-amber-500/[0.07]">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30">
          <MessageSquareWarning className="size-5" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="font-heading text-base font-bold text-amber-900 dark:text-amber-200">
            Tugas Dikembalikan untuk Revisi
          </h2>
          <p className="text-xs text-amber-700/80 dark:text-amber-300/70">
            {feedback.mentorName} · {returnedLabel} WIB
          </p>
        </div>
      </div>

      <blockquote className="mt-4 border-l-2 border-amber-300 pl-4 text-sm leading-relaxed text-amber-900/90 dark:border-amber-500/40 dark:text-amber-100/90">
        “{feedback.text}”
      </blockquote>

      <p className="mt-4 text-xs font-medium text-amber-700/80 dark:text-amber-300/70">
        Perbaiki sesuai catatan di atas, lalu kumpulkan ulang sebelum tenggat berakhir.
      </p>
    </section>
  );
}
