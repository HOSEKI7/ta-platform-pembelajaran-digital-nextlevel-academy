import { PageHeader } from "@/components/dashboard/shared/page-header";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { ContextStrip } from "@/components/internship/final-grade/context-strip";
import { GradeHeroCard } from "@/components/internship/final-grade/grade-hero-card";
import { PerformanceSummary } from "@/components/internship/final-grade/performance-summary";
import type { MagangFinalGrade } from "@/lib/internship-final-grade-types";

type Props = { data: MagangFinalGrade };

/**
 * Orchestrator for `/internship/final-grade`. Server component — no client
 * state, animations are CSS-only. Composition:
 *   PageHeader → GradeHeroCard (graded | empty) → ContextStrip → PerformanceSummary
 */
export function FinalGradeView({ data }: Props) {
  return (
    <StudentPageContainer>
      <PageHeader
        eyebrow="Magang · Peserta"
        title="Nilai"
        accent="Akhir"
        description="Rangkuman penilaian mentor atas keseluruhan kontribusimu selama mengikuti program magang."
      />

      {data.grade === null ? (
        <GradeHeroCard kind="empty" mentorName={data.mentorName} />
      ) : (
        <GradeHeroCard
          kind="graded"
          grade={data.grade}
          gradedAtISO={data.gradedAtISO}
          lastUpdatedISO={data.lastUpdatedISO}
          mentorName={data.mentorName}
          editorName={data.editorName}
          note={data.note}
          noteAuthor={data.noteAuthor}
        />
      )}

      <ContextStrip context={data.context} period={data.period} />

      <PerformanceSummary summary={data.performance} />
    </StudentPageContainer>
  );
}
