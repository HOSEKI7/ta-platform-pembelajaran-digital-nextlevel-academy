/**
 * Client-safe shared types for the Peserta-Magang Nilai Akhir surface.
 *
 * The server loader (`internship-final-grade-loader.ts`) maps DB rows into
 * `MagangFinalGrade`; the page + components consume it directly. Mirrors PRD
 * §6.9.4 — one integer 0–100 grade input by the mentor, with admin override.
 * Supporting `performance` block is *not* part of the formal score (PRD only
 * specifies one number) — it's shown as non-formal context for the student.
 */

import type { InternshipPeriod, MagangContext } from "@/lib/internship-types";

export type GradeBandTone = "emerald" | "sky" | "amber" | "orange" | "rose";

export type GradeBand = {
  letter: string;
  predicate: string;
  tone: GradeBandTone;
};

export type AttendanceSummary = {
  /** Working days elapsed within period (excludes weekends + holidays). */
  expected: number;
  present: number;
  /** 0..100 integer. Falls back to 0 when expected = 0. */
  percentage: number;
};

export type TaskSummary = {
  total: number;
  submitted: number;
  /** 0..100 integer. Falls back to 0 when total = 0. */
  percentage: number;
};

export type PerformanceSummary = {
  attendance: AttendanceSummary;
  tasks: TaskSummary;
};

export type MagangFinalGrade = {
  /** Null while the mentor has not entered a score yet. */
  grade: number | null;
  /** First time a grade was set (server-stored). */
  gradedAtISO: string | null;
  /** Last edit timestamp from `FinalGrade.updatedAt`. */
  lastUpdatedISO: string | null;
  mentorName: string;
  /**
   * Name of the last editor when distinct from the mentor (e.g. admin override
   * per PRD §6.9.4). Null when the mentor themselves was the latest editor, or
   * when no FinalGrade row exists yet.
   */
  editorName: string | null;
  context: MagangContext;
  period: InternshipPeriod;
  performance: PerformanceSummary;
};
