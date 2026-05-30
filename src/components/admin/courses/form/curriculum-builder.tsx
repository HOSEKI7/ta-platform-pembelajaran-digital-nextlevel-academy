"use client";

import { useState } from "react";
import { Layers, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurriculumActions } from "@/hooks/use-admin-curriculum";
import type { SprintDTO } from "@/lib/admin-course-form-types";

import { SectionCard } from "./section-card";
import { SprintCard } from "./sprint-card";

type Props = {
  courseId: string;
  sprints: SprintDTO[];
};

export function CurriculumBuilder({ courseId, sprints }: Props) {
  const actions = useCurriculumActions(courseId);
  const [newTitle, setNewTitle] = useState("");

  const addSprint = () => {
    const title = newTitle.trim();
    if (title.length < 2) {
      toast.error("Nama sprint minimal 2 karakter.");
      return;
    }
    actions.addSprint.mutate(title, {
      onSuccess: () => {
        toast.success("Sprint ditambahkan.");
        setNewTitle("");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menambah sprint."),
    });
  };

  return (
    <SectionCard
      icon={Layers}
      title="Konten Kursus"
      description="Susun kurikulum: sprint berisi tahap video atau quiz."
      aside={
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
          {sprints.length} sprint
        </span>
      }
    >
      {sprints.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
          Belum ada sprint. Tambahkan sprint pertama untuk mulai menyusun materi.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sprints.map((sprint, i) => (
            <SprintCard key={sprint.id} sprint={sprint} index={i} actions={actions} />
          ))}
        </div>
      )}

      {/* Add sprint */}
      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-2 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSprint();
            }
          }}
          placeholder="Nama sprint baru — mis. Sprint 1: Dasar-dasar"
          className="h-11 flex-1 rounded-xl border-0 bg-transparent shadow-none focus-visible:ring-0"
          disabled={actions.addSprint.isPending}
        />
        <Button
          type="button"
          disabled={actions.addSprint.isPending}
          onClick={addSprint}
          className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
        >
          {actions.addSprint.isPending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
          ) : (
            <Plus className="size-4" strokeWidth={2.6} />
          )}
          Tambah Sprint
        </Button>
      </div>
    </SectionCard>
  );
}
