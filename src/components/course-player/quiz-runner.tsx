"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { PlayerStep, QuizStepState } from "@/lib/course-player/types";
import { useQuiz } from "@/lib/course-player/use-quiz";
import { studentKeys } from "@/lib/student-query-keys";

import { QuizIntro } from "./quiz-intro";
import { QuizQuestionSlide } from "./quiz-question-slide";
import { QuizResult } from "./quiz-result";

const MAX_ATTEMPTS = 3;

export type QuizSubmitResponse = {
  score: number;
  passed: boolean;
  attempts: number;
  cooldownUntil: string | null;
  expAwarded: number;
  progressPct: number;
  completedStepIds: string[];
  courseCompleted: boolean;
  correctCount: number;
  totalQuestions: number;
};

type Props = {
  step: PlayerStep;
  quizState: QuizStepState;
  isLast: boolean;
  /**
   * Called with the server response when a submission succeeds (passed or
   * failed). The parent uses this to sync `usePlayerState.completedStepIds`
   * + run cache invalidations.
   */
  onSubmitted: (resp: QuizSubmitResponse) => void;
  onNext: () => void;
};

export function QuizRunner({ step, quizState, isLast, onSubmitted, onNext }: Props) {
  const queryClient = useQueryClient();
  const quiz = step.quiz!; // VideoStage guarantees this before mounting.

  const {
    phase,
    start,
    select,
    nextSlide,
    prevSlide,
    submitStart,
    submitSuccess,
    submitError,
    retry,
  } = useQuiz();

  // The loader only surfaces `cooldownUntil` while it's still in the future
  // (expired timestamps are nulled out server-side), so the presence of
  // `cooldownUntil` here is sufficient evidence that cooldown is active.
  // The CooldownView itself runs the per-second countdown and calls
  // `router.refresh()` once the deadline passes.
  const cooldownActive = quizState.cooldownUntil !== null;

  const mutation = useMutation<QuizSubmitResponse, Error, Map<string, number>>({
    mutationFn: async (answers) => {
      const body = {
        answers: Array.from(answers, ([questionId, optionIndex]) => ({
          questionId,
          optionIndex,
        })),
      };
      const res = await fetch(`/api/learn/${step.id}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: QuizSubmitResponse;
        error?: string;
        cooldownUntil?: string;
      };
      if (!res.ok) {
        const msg = json.error ?? "Gagal mengirim jawaban kuis.";
        throw new Error(msg);
      }
      if (!json.data) throw new Error("Respons tidak lengkap dari server.");
      return json.data;
    },
    onMutate: () => submitStart(),
    onSuccess: (data) => {
      submitSuccess({
        kind: "submitSuccess",
        score: data.score,
        passed: data.passed,
        expAwarded: data.expAwarded,
        correctCount: data.correctCount,
        totalQuestions: data.totalQuestions,
        attempts: data.attempts,
      });
      onSubmitted(data);

      if (data.passed && data.expAwarded > 0) {
        toast.success(`+${data.expAwarded} XP`, {
          description: data.courseCompleted
            ? "Selamat! Kursus tuntas — sertifikat siap diklaim."
            : "Kuis lulus. Lanjut materi berikutnya!",
        });
      }
      if (data.passed) {
        queryClient.invalidateQueries({ queryKey: studentKeys.gameProfile() });
        queryClient.invalidateQueries({ queryKey: studentKeys.dashboard.stats() });
        queryClient.invalidateQueries({ queryKey: studentKeys.dashboard.inProgress() });
      }
    },
    onError: (err) => {
      toast.error(err.message);
      submitError();
    },
  });

  // Whenever the active step changes, snap back to the intro/cooldown view
  // by resetting the in-memory phase. `useQuiz` is local to this component
  // instance so re-mounting on stepId change happens automatically — but
  // <VideoStage> keeps the same <QuizRunner> instance for quiz steps when
  // a parent re-renders. Belt-and-suspenders reset:
  useEffect(() => {
    retry();
    // We intentionally key off `step.id` only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  if (cooldownActive && quizState.cooldownUntil) {
    return (
      <QuizResult
        variant="cooldown"
        passingScore={quiz.passingScore}
        cooldownUntil={quizState.cooldownUntil}
      />
    );
  }

  if (phase.kind === "intro") {
    return (
      <QuizIntro
        title={step.title}
        passingScore={quiz.passingScore}
        totalQuestions={quiz.questions.length}
        state={quizState}
        maxAttempts={MAX_ATTEMPTS}
        onStart={start}
      />
    );
  }

  if (phase.kind === "result") {
    if (phase.passed) {
      return (
        <QuizResult
          variant="passed"
          passingScore={quiz.passingScore}
          score={phase.score}
          expAwarded={phase.expAwarded}
          isLast={isLast}
          onRetry={retry}
          onNext={onNext}
        />
      );
    }
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - phase.attempts);
    return (
      <QuizResult
        variant="failed"
        passingScore={quiz.passingScore}
        score={phase.score}
        attemptsLeft={attemptsLeft}
        onRetry={retry}
      />
    );
  }

  // active or submitting — they share the slide layout (submitting just
  // disables interactions + shows the spinner on the submit button).
  const submitting = phase.kind === "submitting";
  const answers = phase.answers;
  const index = phase.kind === "active" ? phase.index : 0;
  const question = quiz.questions[index]!;
  const total = quiz.questions.length;
  const isFirst = index === 0;
  const isLastSlide = index === total - 1;
  const allAnswered = quiz.questions.every((q) => answers.has(q.id));
  const answeredByIndex = quiz.questions.map((q) => answers.has(q.id));

  const handleSubmit = () => {
    if (!allAnswered || submitting) return;
    mutation.mutate(answers);
  };

  return (
    <QuizQuestionSlide
      question={question}
      index={index}
      total={total}
      selectedIndex={answers.get(question.id)}
      allAnswered={allAnswered}
      answeredByIndex={answeredByIndex}
      isFirst={isFirst}
      isLast={isLastSlide}
      submitting={submitting}
      onSelect={select}
      onPrev={prevSlide}
      onNext={nextSlide}
      onSubmit={handleSubmit}
    />
  );
}
