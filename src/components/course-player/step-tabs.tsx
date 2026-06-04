"use client";

import { useState } from "react";
import { BookOpen, PenLine } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PlayerCourse, PlayerStep } from "@/lib/course-player/types";
import { StepDescription } from "./step-description";
import { StepNotes } from "./step-notes";

type Props = {
  step: PlayerStep;
  course: PlayerCourse;
  noteContent: string;
  onNoteSaved: (stepId: string, content: string) => void;
};

type TabValue = "deskripsi" | "catatan";

export function StepTabs({ step, course, noteContent, onNoteSaved }: Props) {
  const [value, setValue] = useState<TabValue>("deskripsi");
  const [prevStepId, setPrevStepId] = useState(step.id);

  // Reset to "Deskripsi" when the active step changes — fresh material,
  // fresh start. Uses the "adjust state during render" pattern so we don't
  // pay an extra render cycle just to clear the tab.
  if (step.id !== prevStepId) {
    setPrevStepId(step.id);
    setValue("deskripsi");
  }

  return (
    <div className="mt-8 rounded-2xl border border-[color:var(--player-hairline)] bg-[color:var(--player-surface)] p-5 sm:p-6">
      <Tabs value={value} onValueChange={(v) => setValue(v as TabValue)}>
        <TabsList
          variant="line"
          className="mb-5 h-auto w-full justify-start overflow-x-auto rounded-none border-b border-[color:var(--player-hairline)] pb-2"
        >
          <TabTrigger value="deskripsi" icon={BookOpen} label="Deskripsi" />
          <TabTrigger value="catatan" icon={PenLine} label="Catatan" />
        </TabsList>

        <TabsContent value="deskripsi" className="pt-2">
          <StepDescription step={step} course={course} />
        </TabsContent>

        <TabsContent value="catatan" className="pt-2">
          <StepNotes
            stepId={step.id}
            initialContent={noteContent}
            onNoteSaved={onNoteSaved}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({
  value,
  icon: Icon,
  label,
}: {
  value: TabValue;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "h-9 gap-2 rounded-none border-0 px-4 text-sm font-semibold text-zinc-500 transition-colors",
        "data-active:text-[color:var(--player-accent)] dark:data-active:text-[color:var(--player-accent)]",
        "after:!bg-[color:var(--player-accent)] after:!bottom-[-9px] after:!h-[2px]",
      )}
    >
      <Icon className="size-4" strokeWidth={2.4} />
      {label}
    </TabsTrigger>
  );
}
