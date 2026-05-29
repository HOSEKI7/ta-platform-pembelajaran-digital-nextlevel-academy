import { GraduationCap, School, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import type { MentorStudentRow, MentorStudentsData } from "@/lib/mentor-types";

type Props = {
  data: MentorStudentsData;
};

const MAX_STUDENTS = 10; // PRD §6.9 — class cap.

/** First two initials of a name, brand-colored fallback for the avatar. */
function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "NL"
  );
}

/** Stagger delay so rows cascade in on load (CSS-only via tw-animate-css). */
function rowDelay(index: number): string {
  return `${Math.min(index, 9) * 55}ms`;
}

/** Avatar + name cell, shared between the desktop table and mobile cards. */
function PersonCell({ student }: { student: MentorStudentRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {student.image ? (
          <AvatarImage src={student.image} alt={student.name} />
        ) : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(student.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
        {student.name}
      </span>
    </div>
  );
}

/** University value with an empty-state placeholder when not filled in. */
function University({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span className="text-sm italic text-zinc-400 dark:text-zinc-500">
        Belum diisi
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <School
        className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500"
        strokeWidth={2}
      />
      <span className="truncate">{value}</span>
    </span>
  );
}

export function MentorStudentsTable({ data }: Props) {
  const { context, students } = data;
  const count = students.length;

  return (
    <StudentPageContainer>
      <PageHeader
        eyebrow="Mentor · Daftar Peserta"
        title="Daftar"
        accent="Peserta"
        description={`Peserta magang di kelas bimbinganmu — ${context.classFullName}.`}
      />

      <section
        className={cn(
          "overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        {/* Card header: identity + roster count */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <UsersRound className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Peserta Bimbingan
              </h2>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {context.batchLabel} · {context.fieldLabel} · Kelas{" "}
                {context.section}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold tabular-nums text-zinc-600 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/15">
            {count}
            <span className="font-medium text-zinc-400 dark:text-zinc-500">
              / {MAX_STUDENTS}
            </span>
          </span>
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
              <GraduationCap className="size-6" strokeWidth={2} />
            </span>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Belum ada peserta di kelas ini.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: semantic table */}
            <div className="hidden sm:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:border-[color:var(--color-surface-border)] dark:text-zinc-500">
                    <th className="w-16 px-6 py-3 text-center font-semibold">
                      No.
                    </th>
                    <th className="px-2 py-3 font-semibold">Nama Peserta</th>
                    <th className="px-6 py-3 font-semibold">Universitas</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{ animationDelay: rowDelay(i) }}
                      className={cn(
                        "border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/80",
                        "dark:border-white/[0.04] dark:hover:bg-white/[0.03]",
                        "fade-in-0 slide-in-from-bottom-1 fill-mode-both animate-in duration-500",
                      )}
                    >
                      <td className="px-6 py-3 text-center font-heading text-sm font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-2 py-3">
                        <PersonCell student={s} />
                      </td>
                      <td className="px-6 py-3">
                        <University value={s.institution} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <ul className="divide-y divide-zinc-50 sm:hidden dark:divide-white/[0.04]">
              {students.map((s, i) => (
                <li
                  key={s.id}
                  style={{ animationDelay: rowDelay(i) }}
                  className="fade-in-0 slide-in-from-bottom-1 fill-mode-both flex animate-in flex-col gap-2 px-5 py-4 duration-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <PersonCell student={s} />
                  </div>
                  <div className="pl-1">
                    <University value={s.institution} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </StudentPageContainer>
  );
}
