"use client";

import { useCallback, useMemo, useState } from "react";

import { findStep, flattenSteps } from "@/lib/course-player/flatten";
import type { PlayerCourse, StepStatus } from "@/lib/course-player/types";
import { statusOf as statusOfFn, usePlayerState } from "@/lib/course-player/use-player-state";
import { CurriculumSidebar } from "./curriculum-sidebar";
import { MobileCurriculumSheet } from "./mobile-curriculum-sheet";
import { PlayerTopbar } from "./player-topbar";
import { StepTabs } from "./step-tabs";
import { VideoStage } from "./video-stage";

type Props = {
  course: PlayerCourse;
};

export function CoursePlayer({ course }: Props) {
  const { state, select, complete, goNext } = usePlayerState(course);
  const [mobileOpen, setMobileOpen] = useState(false);

  const statusOf = useCallback(
    (stepId: string): StepStatus => statusOfFn(stepId, state, course),
    [state, course],
  );

  // Resolve current active step + whether it's the very last step in the course.
  const activeStep = useMemo(() => findStep(course, state.activeStepId), [course, state.activeStepId]);
  const isLastStep = useMemo(() => {
    const flat = flattenSteps(course);
    return flat[flat.length - 1]?.id === state.activeStepId;
  }, [course, state.activeStepId]);

  const handleComplete = useCallback(() => {
    complete(state.activeStepId);
  }, [complete, state.activeStepId]);

  // Defensive: should never happen because `initialState` always picks a valid id.
  if (!activeStep) return null;

  const isCompleted = state.completedStepIds.has(state.activeStepId);

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

      {/* Mobile drawer */}
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
