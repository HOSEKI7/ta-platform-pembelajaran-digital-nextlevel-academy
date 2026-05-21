export type StepType = "VIDEO" | "QUIZ";

export type StepStatus = "completed" | "active" | "available" | "locked";

export type PlayerResource = {
  label: string;
  href: string;
  kind: "pdf" | "link" | "code";
  meta?: string;
};

export type PlayerStep = {
  id: string;
  title: string;
  type: StepType;
  durationSec: number;
  description: string;
  resources?: PlayerResource[];
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
 * What the server-side loader returns and what the `<CoursePlayer />` root
 * client component consumes. Embed URLs are pre-signed at request time so
 * the client never sees the raw Bunny token-auth key.
 */
export type CoursePlayerData = {
  course: PlayerCourse;
  completedStepIds: string[];
  embedUrls: Record<string, string>;
  courseId: string;
  enrollmentId: string;
};
