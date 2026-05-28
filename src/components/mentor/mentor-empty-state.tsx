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
 * Shown when a MENTOR has no MentorProfile yet (admin hasn't assigned them to a
 * class). Without a class there are no mentees / tasks / attendance to surface.
 */
export function MentorEmptyState({ title, accent, eyebrow }: Props) {
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
          Belum ditugaskan ke kelas
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Akunmu belum dikaitkan dengan kelas mana pun. Hubungi admin untuk
          ditugaskan ke sebuah kelas agar daftar peserta, absensi, dan tugas
          tampil di sini.
        </p>
      </div>
    </StudentPageContainer>
  );
}
