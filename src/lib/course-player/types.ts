export type StepType = "VIDEO" | "QUIZ";

export type StepStatus = "completed" | "active" | "available" | "locked";

/**
 * Single quiz option. A string is treated as an image when it matches
 * `^(https?:\/\/|\/)` (URL or root-relative path); otherwise it renders as
 * text. Mirrors how `QuizQuestion.options` is stored in the DB (Json array).
 */
export type PlayerQuizOption = string;

export type PlayerQuizQuestion = {
  id: string;
  question: string | null;
  questionImageUrl: string | null;
  options: PlayerQuizOption[];
  order: number;
  // NOTE: `answer` (the correct option index) is intentionally NOT sent to
  // the client. It only ever lives server-side.
};

export type PlayerQuiz = {
  passingScore: number;
  questions: PlayerQuizQuestion[];
};

export type PlayerStep = {
  id: string;
  title: string;
  type: StepType;
  durationSec: number;
  description: string;
  /** Populated only when `type === "QUIZ"`. */
  quiz?: PlayerQuiz;
};

export type PlayerSprint = {
  id: string;
  title: string;
  order: number;
  steps: PlayerStep[];
};

export type PlayerInstructor = {
  name: string;
  role: string;
  bio: string;
  avatarInitials: string;
};

export type PlayerCourse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  instructor: PlayerInstructor;
  sprints: PlayerSprint[];
};

/**
 * Per-quiz-step server state surfaced to the client at page load. Drives the
 * quiz runner's initial phase (intro / cooldown / passed banner) and the
 * attempts-remaining counter.
 */
export type QuizStepState = {
  stepId: string;
  /** `StepProgress.quizAttempts` — within the CURRENT 3-attempt window. */
  attempts: number;
  /** ISO timestamp; null when no cooldown is active. */
  cooldownUntil: string | null;
  /** `StepProgress.quizScore` of the latest attempt (0..100), if any. */
  lastScore: number | null;
  /** True once the student has passed (StepProgress.isCompleted === true). */
  isPassed: boolean;
};

/**
 * What the server-side loader returns and what the `<CoursePlayer />` root
 * client component consumes. Embed URLs are pre-signed at request time so
 * the client never sees the raw Bunny token-auth key.
 */
export type CoursePlayerData = {
  course: PlayerCourse;
  completedStepIds: string[];
  /** Per-step personal notes (Catatan tab), keyed by step id. Empty when none. */
  notes: Record<string, string>;
  embedUrls: Record<string, string>;
  /** Keyed by step id. Only present for steps where `type === "QUIZ"`. */
  quizStates: Record<string, QuizStepState>;
  courseId: string;
  enrollmentId: string;
};
