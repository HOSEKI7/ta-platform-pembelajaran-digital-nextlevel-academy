/**
 * Client-safe DTOs for the admin course create/edit surfaces. No Prisma imports
 * so these can cross into client components freely (the loader maps Prisma rows
 * into these shapes server-side).
 */

import type { CourseStatusValue } from "@/lib/validations/admin-course";

export type VideoStatusValue = "PROCESSING" | "READY" | "FAILED";

export type AdminCategoryOption = { id: string; name: string };

export type BenefitDTO = { text: string };
export type FaqDTO = { question: string; answer: string };

export type QuizQuestionDTO = {
  id: string;
  question: string;
  /** Signed image URL for rendering (empty when none). */
  questionImageUrl: string;
  /** Raw stored image path/URL, kept so edits can preserve it. */
  questionImageRaw: string | null;
  options: string[];
  answer: number;
};

export type VideoStepDTO = {
  id: string;
  type: "VIDEO";
  title: string;
  description: string;
  order: number;
  video: {
    bunnyVideoId: string;
    duration: number;
    status: VideoStatusValue;
    videoUrl: string | null;
  } | null;
};

export type QuizStepDTO = {
  id: string;
  type: "QUIZ";
  title: string;
  description: string;
  order: number;
  passingScore: number;
  questions: QuizQuestionDTO[];
};

export type StepDTO = VideoStepDTO | QuizStepDTO;

export type SprintDTO = {
  id: string;
  title: string;
  order: number;
  steps: StepDTO[];
};

export type CourseEditData = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName: string;
  /** Signed/resolved for rendering; "" when unset. */
  thumbnailUrl: string;
  instructorImgUrl: string;
  price: number;
  fakePrice: number | null;
  instructor: string;
  instructorBio: string;
  isFeatured: boolean;
  status: CourseStatusValue;
  publishedAt: string | null;
  benefits: BenefitDTO[];
  faqs: FaqDTO[];
  sprints: SprintDTO[];
};
