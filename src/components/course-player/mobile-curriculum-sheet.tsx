"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { PlayerCourse, StepStatus } from "@/lib/course-player/types";
import type { PlayerState } from "@/lib/course-player/use-player-state";
import { CurriculumSidebar } from "./curriculum-sidebar";

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  course: PlayerCourse;
  state: PlayerState;
  statusOf: (stepId: string) => StepStatus;
  onSelect: (stepId: string) => void;
};

export function MobileCurriculumSheet({
  open,
  onOpenChange,
  course,
  state,
  statusOf,
  onSelect,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-[88vw] max-w-[420px] border-l border-[color:var(--player-hairline)] bg-[color:var(--player-surface)] p-0 sm:max-w-[420px]"
      >
        <CurriculumSidebar
          course={course}
          state={state}
          statusOf={statusOf}
          onSelect={(stepId) => {
            onSelect(stepId);
            onOpenChange(false);
          }}
          variant="drawer"
        />
      </SheetContent>
    </Sheet>
  );
}
