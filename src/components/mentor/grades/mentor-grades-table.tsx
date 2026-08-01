"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Award, GraduationCap, Pencil, Plus, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { resolveGradeBand, TONE_SURFACE } from "@/components/internship/final-grade/final-grade-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useUpsertGradeMutation } from "@/hooks/use-mentor-grade-actions";
import type { MentorGradeRow, MentorGradesData } from "@/lib/mentor-types";

import { AssignGradeDialog } from "./assign-grade-dialog";

type Props = {
  data: MentorGradesData;
};

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
function PersonCell({ row }: { row: MentorGradeRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="shrink-0">
        {row.image ? <AvatarImage src={row.image} alt={row.name} /> : null}
        <AvatarFallback className="bg-[color:var(--color-brand-500)] text-xs font-bold text-white">
          {initialsOf(row.name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
        {row.name}
      </span>
    </div>
  );
}

/** Grade value as a color-tiered pill, or a muted dash when ungraded. */
function GradeBadge({ grade }: { grade: number | null }) {
  if (grade === null) {
    return (
      <span className="font-heading text-base font-bold text-zinc-300 dark:text-zinc-600">
        —
      </span>
    );
  }
  // ponytail: reuse authoritative 9-tier band instead of inline 3-tier.
  const band = resolveGradeBand(grade);
  return (
    <span
      className={cn(
        "inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1 font-heading text-sm font-bold tabular-nums ring-1",
        TONE_SURFACE[band.tone],
      )}
    >
      {grade}
    </span>
  );
}

/** Interactive badge shown when admin has overridden and locked the grade. */
function OverriddenBadge({ row }: { row: MentorGradeRow }) {
  const [showReason, setShowReason] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowReason(true)}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 transition",
          "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30 dark:hover:bg-amber-500/25",
        )}
      >
        <ShieldAlert className="size-3.5" strokeWidth={2.4} />
        Overridden!
      </button>

      {showReason ? (
        <Dialog open onOpenChange={(o) => !o && setShowReason(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-amber-500" strokeWidth={2.2} />
                Nilai Dikunci Admin
              </DialogTitle>
              <DialogDescription>
                Nilai akhir untuk{" "}
                <span className="font-semibold text-foreground">{row.name}</span> telah di-override dan dikunci oleh admin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alasan Perubahan Admin:
              </span>
              <div className="rounded-xl bg-amber-500/10 p-3.5 text-sm text-foreground ring-1 ring-amber-500/20">
                {row.overrideReason?.trim() || "Tidak ada alasan spesifik yang dicatat."}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowReason(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

/** Assign / Edit action button — label flips once a grade exists, or displays locked badge. */
function GradeAction({
  row,
  onClick,
}: {
  row: MentorGradeRow;
  onClick: () => void;
}) {
  if (row.isLocked) {
    return <OverriddenBadge row={row} />;
  }
  const isEdit = row.grade !== null;
  return (
    <Button
      type="button"
      size="sm"
      variant={isEdit ? "outline" : "default"}
      onClick={onClick}
      className={cn(
        !isEdit &&
          "bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]",
      )}
    >
      {isEdit ? (
        <Pencil className="size-3.5" strokeWidth={2.4} />
      ) : (
        <Plus className="size-3.5" strokeWidth={2.4} />
      )}
      {isEdit ? "Edit Nilai" : "Beri Nilai"}
    </Button>
  );
}

/**
 * Mounts the grade dialog + its per-student mutation together. Keyed by
 * `studentId` in the parent so it remounts (and reseeds form state) per row.
 */
function GradeDialogController({
  row,
  onClose,
}: {
  row: MentorGradeRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const mutation = useUpsertGradeMutation(row.studentId);

  return (
    <AssignGradeDialog
      open
      onOpenChange={(o) => {
        if (!o && !mutation.isPending) onClose();
      }}
      row={row}
      submitting={mutation.isPending}
      onSubmit={(payload) =>
        mutation.mutate(payload, {
          onSuccess: () => {
            toast.success(`Nilai ${row.name} tersimpan.`);
            router.refresh();
            onClose();
          },
          onError: (err) =>
            toast.error(
              err instanceof Error ? err.message : "Gagal menyimpan nilai.",
            ),
        })
      }
    />
  );
}

export function MentorGradesTable({ data }: Props) {
  const { context, grades } = data;
  const count = grades.length;
  const gradedCount = grades.filter((g) => g.grade !== null).length;
  const [selected, setSelected] = useState<MentorGradeRow | null>(null);

  return (
    <StudentPageContainer>
      <PageHeader
        eyebrow="Mentor · Nilai Akhir"
        title="Nilai"
        accent="Akhir"
        description={`Beri nilai akhir peserta magang di kelas bimbinganmu — ${context.classFullName}.`}
      />

      <section
        className={cn(
          "overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200",
          "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        )}
      >
        {/* Card header: identity + graded progress */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-[color:var(--color-surface-border)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <Award className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                Penilaian Akhir
              </h2>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {context.batchLabel} · {context.fieldLabel} · Kelas{" "}
                {context.section}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold tabular-nums text-zinc-600 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/15">
            {gradedCount}
            <span className="font-medium text-zinc-400 dark:text-zinc-500">
              / {count} dinilai
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
                    <th className="px-2 py-3 font-semibold">Nama Lengkap</th>
                    <th className="px-6 py-3 font-semibold">Nilai Akhir</th>
                    <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, i) => (
                    <tr
                      key={g.studentId}
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
                        <PersonCell row={g} />
                      </td>
                      <td className="px-6 py-3">
                        <GradeBadge grade={g.grade} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <GradeAction row={g} onClick={() => setSelected(g)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <ul className="divide-y divide-zinc-50 sm:hidden dark:divide-white/[0.04]">
              {grades.map((g, i) => (
                <li
                  key={g.studentId}
                  style={{ animationDelay: rowDelay(i) }}
                  className="fade-in-0 slide-in-from-bottom-1 fill-mode-both flex animate-in flex-col gap-3 px-5 py-4 duration-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold tabular-nums text-zinc-300 dark:text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <PersonCell row={g} />
                  </div>
                  <div className="flex items-center justify-between pl-1">
                    <GradeBadge grade={g.grade} />
                    <GradeAction row={g} onClick={() => setSelected(g)} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {selected ? (
        <GradeDialogController
          key={selected.studentId}
          row={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </StudentPageContainer>
  );
}
