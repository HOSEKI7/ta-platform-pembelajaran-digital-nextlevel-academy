import { UserRoundX } from "lucide-react";

import { cn } from "@/lib/utils";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { PageHeader } from "@/components/dashboard/shared/page-header";

type Props = {
  title: string;
  accent: string;
  eyebrow: string;
};

/**
 * Shown when a PESERTA_MAGANG has no InternshipProfile yet (admin hasn't placed
 * them in a class). Without a class there's no batch/period/attendance to show.
 */
export function InternshipEmptyState({ title, accent, eyebrow }: Props) {
  return (
    <StudentPageContainer>
      <PageHeader eyebrow={eyebrow} title={title} accent={accent} />
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-zinc-200",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
          <UserRoundX className="size-7" strokeWidth={2} />
        </span>
        <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Belum ditempatkan di kelas magang
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Akunmu belum dikaitkan dengan kelas magang mana pun. Hubungi admin untuk
          ditempatkan di batch dan kelas agar fitur absensi dan tugas aktif.
        </p>
      </div>
    </StudentPageContainer>
  );
}
