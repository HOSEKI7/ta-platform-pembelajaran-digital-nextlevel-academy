"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { findStep, flattenSteps } from "@/lib/course-player/flatten";
import type { CoursePlayerData, StepStatus } from "@/lib/course-player/types";
import { statusOf as statusOfFn, usePlayerState } from "@/lib/course-player/use-player-state";
import { studentKeys } from "@/lib/student-query-keys";

import { CurriculumSidebar } from "./curriculum-sidebar";
import { MobileCurriculumSheet } from "./mobile-curriculum-sheet";
import { PlayerTopbar } from "./player-topbar";
import { StepTabs } from "./step-tabs";
import { VideoStage } from "./video-stage";

type Props = {
  data: CoursePlayerData;
};

type CompleteResponse = {
  progressPct: number;
  completedStepIds: string[];
  totalExpAwarded: number;
  courseCompleted: boolean;
};

export function CoursePlayer({ data }: Props) {
  const { course, completedStepIds, embedUrls } = data;
  const { state, select, complete, hydrate, goNext } = usePlayerState({
    course,
    completedStepIds,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const statusOf = useCallback(
    (stepId: string): StepStatus => statusOfFn(stepId, state, course),
    [state, course],
  );

  const activeStep = useMemo(
    () => findStep(course, state.activeStepId),
    [course, state.activeStepId],
  );
  const isLastStep = useMemo(() => {
    const flat = flattenSteps(course);
    return flat[flat.length - 1]?.id === state.activeStepId;
  }, [course, state.activeStepId]);

  const completeMutation = useMutation<CompleteResponse, Error, string>({
    mutationFn: async (stepId) => {
      const res = await fetch(`/api/learn/${stepId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: CompleteResponse;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Gagal menandai materi selesai.");
      }
      if (!json.data) throw new Error("Respons tidak lengkap dari server.");
      return json.data;
    },
    onMutate: (stepId) => {
      // Optimistic — the button morph + particle burst render instantly.
      complete(stepId);
    },
    onSuccess: (result) => {
      // Reconcile with server: covers idempotent calls and cross-tab edits.
      hydrate(new Set(result.completedStepIds));
      if (result.totalExpAwarded > 0) {
        toast.success(`+${result.totalExpAwarded} XP`, {
          description: result.courseCompleted
            ? "Selamat! Kursus tuntas — sertifikat siap diklaim."
            : "Lanjut materi berikutnya.",
        });
      }
      // Refresh downstream caches so the dashboard / "Kursus Saya" reflect
      // the new progress immediately when the student leaves the player.
      queryClient.invalidateQueries({ queryKey: studentKeys.gameProfile() });
      queryClient.invalidateQueries({ queryKey: studentKeys.dashboard.stats() });
      queryClient.invalidateQueries({ queryKey: studentKeys.dashboard.inProgress() });
    },
    onError: (err) => {
      toast.error(err.message);
      // Pull fresh state from the server — drops the optimistic completion.
      router.refresh();
    },
  });

  const handleComplete = useCallback(() => {
    if (!activeStep || completeMutation.isPending) return;
    completeMutation.mutate(activeStep.id);
  }, [activeStep, completeMutation]);

  if (!activeStep) return null;

  const isCompleted = state.completedStepIds.has(state.activeStepId);
  const embedUrl = embedUrls[activeStep.id];

  return (
    <>
      <PlayerTopbar
        courseTitle={course.title}
        courseCategory={course.category}
        onOpenCurriculum={() => setMobileOpen(true)}
      />

      <main className="w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 2xl:px-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px] 2xl:gap-8">
          {/* Left column: video stage + tabs */}
          <div
            className="min-w-0"
            style={{ animation: "player-stagger 0.5s cubic-bezier(0.2,0.7,0.2,1) 40ms both" }}
          >
            <VideoStage
              step={activeStep}
              sprintTitle={activeStep.sprintTitle}
              isCompleted={isCompleted}
              isLast={isLastStep}
              embedUrl={embedUrl}
              loading={completeMutation.isPending}
              onComplete={handleComplete}
              onNext={goNext}
            />
            <StepTabs step={activeStep} course={course} />
          </div>

          {/* Right column: sticky curriculum sidebar (desktop only) */}
          <div className="hidden lg:block">
            <CurriculumSidebar
              course={course}
              state={state}
              statusOf={statusOf}
              onSelect={select}
            />
          </div>
        </div>
      </main>

      <MobileCurriculumSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        course={course}
        state={state}
        statusOf={statusOf}
        onSelect={select}
      />
    </>
  );
}
