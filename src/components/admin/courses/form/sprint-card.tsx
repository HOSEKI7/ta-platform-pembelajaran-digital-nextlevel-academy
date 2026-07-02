"use client";

import { useState } from "react";
import { Check, ListChecks, Loader2, Pencil, Plus, Trash2, Video, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SprintDTO, StepDTO } from "@/lib/admin-course-form-types";
import type { useCurriculumActions } from "@/hooks/use-admin-curriculum";

import { StepRow } from "./step-row";
import { ConfirmDialog } from "./confirm-dialog";
import { VideoStepDialog } from "./video-step-dialog";
import { QuizStepDialog } from "./quiz-step-dialog";

type Actions = ReturnType<typeof useCurriculumActions>;

type DialogState<T> = { open: boolean; step: T | null };

type Props = {
  sprint: SprintDTO;
  index: number;
  actions: Actions;
};

export function SprintCard({ sprint, index, actions }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(sprint.title);
  const [addMenu, setAddMenu] = useState(false);
  const [confirmDeleteSprint, setConfirmDeleteSprint] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<StepDTO | null>(null);
  const [videoDialog, setVideoDialog] = useState<DialogState<StepDTO>>({ open: false, step: null });
  const [quizDialog, setQuizDialog] = useState<DialogState<StepDTO>>({ open: false, step: null });
  // Bumped on every open so each dialog remounts and re-seeds from `initial`.
  const [dialogNonce, setDialogNonce] = useState(0);

  const stepSaving = actions.addStep.isPending || actions.updateStep.isPending;

  const openVideo = (step: StepDTO | null) => {
    setDialogNonce((n) => n + 1);
    setVideoDialog({ open: true, step });
  };
  const openQuiz = (step: StepDTO | null) => {
    setDialogNonce((n) => n + 1);
    setQuizDialog({ open: true, step });
  };

  const saveRename = () => {
    const title = draftTitle.trim();
    if (title.length < 2) {
      toast.error("Nama sprint minimal 2 karakter.");
      return;
    }
    actions.renameSprint.mutate(
      { sprintId: sprint.id, title },
      {
        onSuccess: () => setRenaming(false),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal."),
      },
    );
  };

  const handleDeleteSprint = () =>
    actions.deleteSprint.mutate(sprint.id, {
      onSuccess: () => {
        toast.success("Sprint dihapus.");
        setConfirmDeleteSprint(false);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menghapus."),
    });

  const handleDeleteStep = () => {
    if (!stepToDelete) return;
    actions.deleteStep.mutate(stepToDelete.id, {
      onSuccess: () => {
        toast.success("Tahap dihapus.");
        setStepToDelete(null);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menghapus."),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/40 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.015]">
      {/* Sprint header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
          {index + 1}
        </span>
        {renaming ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={draftTitle}
              autoFocus
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") {
                  setDraftTitle(sprint.title);
                  setRenaming(false);
                }
              }}
              className="h-9 rounded-lg"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={actions.renameSprint.isPending}
              onClick={saveRename}
              aria-label="Simpan nama"
              className="text-emerald-600"
            >
              {actions.renameSprint.isPending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : (
                <Check className="size-4" strokeWidth={2.6} />
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setDraftTitle(sprint.title);
                setRenaming(false);
              }}
              aria-label="Batal"
            >
              <X className="size-4" strokeWidth={2.4} />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="flex-1 truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {sprint.title}
            </h3>
            <span className="hidden text-xs text-zinc-400 sm:inline">
              {sprint.steps.length} tahap
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setDraftTitle(sprint.title);
                setRenaming(true);
              }}
              aria-label="Ubah nama sprint"
              className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"
            >
              <Pencil className="size-4" strokeWidth={2.2} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setConfirmDeleteSprint(true)}
              aria-label="Hapus sprint"
              className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="size-4" strokeWidth={2.2} />
            </Button>
          </>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 p-3">
        {sprint.steps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-center text-xs text-zinc-500 dark:border-[color:var(--color-surface-border)] dark:text-zinc-400">
            Belum ada tahap. Tambahkan video atau quiz.
          </p>
        ) : (
          sprint.steps.map((step) => (
            <StepRow
              key={step.id}
              step={step}
              deleting={actions.deleteStep.isPending && stepToDelete?.id === step.id}
              onEdit={() => (step.type === "VIDEO" ? openVideo(step) : openQuiz(step))}
              onDelete={() => setStepToDelete(step)}
            />
          ))
        )}

        {/* Add step */}
        {addMenu ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--color-brand-300)] bg-[color:var(--color-brand-50)]/40 p-2 dark:border-[color:var(--color-brand-500)]/40 dark:bg-[color:var(--color-brand-500)]/[0.06]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg bg-white dark:bg-transparent"
              onClick={() => {
                openVideo(null);
                setAddMenu(false);
              }}
            >
              <Video className="size-4" strokeWidth={2.2} />
              Video
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg bg-white dark:bg-transparent"
              onClick={() => {
                openQuiz(null);
                setAddMenu(false);
              }}
            >
              <ListChecks className="size-4" strokeWidth={2.2} />
              Quiz
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setAddMenu(false)}>
              <X className="size-4" strokeWidth={2.4} />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddMenu(true)}
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[color:var(--color-brand-600)] transition hover:bg-[color:var(--color-brand-50)] dark:text-[color:var(--color-brand-300)] dark:hover:bg-[color:var(--color-brand-500)]/10",
            )}
          >
            <Plus className="size-3.5" strokeWidth={2.6} />
            Tambah Tahap
          </button>
        )}
      </div>

      {/* Dialogs */}
      <VideoStepDialog
        key={`video-${dialogNonce}`}
        open={videoDialog.open}
        onOpenChange={(o) => setVideoDialog((s) => ({ ...s, open: o }))}
        mode={videoDialog.step ? "edit" : "create"}
        initial={
          videoDialog.step && videoDialog.step.type === "VIDEO"
            ? {
                title: videoDialog.step.title,
                description: videoDialog.step.description,
                bunnyVideoId: videoDialog.step.video?.bunnyVideoId ?? "",
              }
            : undefined
        }
        saving={stepSaving}
        sprintId={sprint.id}
        onSave={(payload) => {
          const onSettled = {
            onSuccess: () => {
              toast.success("Tahap video disimpan.");
              setVideoDialog({ open: false, step: null });
            },
            onError: (e: Error) => toast.error(e.message),
          };
          if (videoDialog.step) {
            actions.updateStep.mutate(
              { stepId: videoDialog.step.id, payload: { type: "VIDEO", ...payload } },
              onSettled,
            );
          } else {
            actions.addStep.mutate(
              { sprintId: sprint.id, payload: { type: "VIDEO", ...payload } },
              onSettled,
            );
          }
        }}
      />

      <QuizStepDialog
        key={`quiz-${dialogNonce}`}
        open={quizDialog.open}
        onOpenChange={(o) => setQuizDialog((s) => ({ ...s, open: o }))}
        mode={quizDialog.step ? "edit" : "create"}
        initial={
          quizDialog.step && quizDialog.step.type === "QUIZ"
            ? {
                title: quizDialog.step.title,
                description: quizDialog.step.description,
                passingScore: quizDialog.step.passingScore,
                questions: quizDialog.step.questions.map((q) => ({
                  key: q.id,
                  question: q.question,
                  imagePath: q.questionImageRaw,
                  imageUrl: q.questionImageUrl || null,
                  options: q.options.length >= 2 ? q.options : ["", ""],
                  answer: q.answer,
                })),
              }
            : undefined
        }
        saving={stepSaving}
        onSave={(payload) => {
          const onSettled = {
            onSuccess: () => {
              toast.success("Tahap quiz disimpan.");
              setQuizDialog({ open: false, step: null });
            },
            onError: (e: Error) => toast.error(e.message),
          };
          if (quizDialog.step) {
            actions.updateStep.mutate(
              { stepId: quizDialog.step.id, payload: { type: "QUIZ", ...payload } },
              onSettled,
            );
          } else {
            actions.addStep.mutate(
              { sprintId: sprint.id, payload: { type: "QUIZ", ...payload } },
              onSettled,
            );
          }
        }}
      />

      <ConfirmDialog
        open={confirmDeleteSprint}
        onOpenChange={setConfirmDeleteSprint}
        title="Hapus sprint ini?"
        description={
          <>
            Sprint <span className="font-semibold text-foreground">“{sprint.title}”</span> beserta
            seluruh tahap di dalamnya akan dihapus permanen.
          </>
        }
        confirmLabel="Hapus Sprint"
        busy={actions.deleteSprint.isPending}
        onConfirm={handleDeleteSprint}
      />

      <ConfirmDialog
        open={stepToDelete !== null}
        onOpenChange={(o) => !o && setStepToDelete(null)}
        title="Hapus tahap ini?"
        description={
          <>
            Tahap <span className="font-semibold text-foreground">“{stepToDelete?.title}”</span> akan
            dihapus permanen.
          </>
        }
        confirmLabel="Hapus Tahap"
        busy={actions.deleteStep.isPending}
        onConfirm={handleDeleteStep}
      />
    </div>
  );
}
