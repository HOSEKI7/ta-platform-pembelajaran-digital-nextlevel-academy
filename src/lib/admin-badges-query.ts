/**
 * Shared types + query-key factory + URL parsers for the admin Badge Management
 * surface at `/admin/gamification` (PRD §6.11.8). Safe to import from both
 * Server and Client Components — keep this file free of any Prisma / server-only
 * imports. The data layer lives in `./admin-badges-loader.ts`.
 */

import type { BadgeTriggerKey } from "@/lib/gamification-types";

export const PAGE_SIZE = 10;

/** Trigger dropdown values — "all" is the unfiltered default. */
export const TRIGGER_FILTERS = [
  "all",
  "LEVEL_REACHED",
  "COURSES_COMPLETED",
  "COURSE_SPECIFIC",
] as const;
export type TriggerFilter = (typeof TRIGGER_FILTERS)[number];

/** Indonesian labels for each trigger (UI). */
export const TRIGGER_LABELS: Record<BadgeTriggerKey, string> = {
  LEVEL_REACHED: "Capai Level",
  COURSES_COMPLETED: "Total Kursus Selesai",
  COURSE_SPECIFIC: "Kursus Tertentu",
};

export type AdminBadgesParams = {
  page: number;
  search: string;
  trigger: TriggerFilter;
};

export type AdminBadgeRow = {
  id: string;
  name: string;
  description: string | null;
  trigger: BadgeTriggerKey;
  threshold: number;
  courseId: string | null;
  courseTitle: string | null;
  /** Informational only (PRD §6.11.8). */
  expMinimum: number;
  /** Resolved icon URL (preset / signed Bunny) for display, or null → fallback. */
  logoUrl: string | null;
  /** Raw stored value (preset path / Bunny object-path) — needed to re-submit on edit. */
  logoStored: string | null;
  /** How many users currently hold this badge. */
  earnedCount: number;
  /** Auto-generated "cara mendapat" text when description is empty. */
  howToEarn: string;
};

export type AdminBadgesResult = {
  rows: AdminBadgeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Course option for the COURSE_SPECIFIC dropdown. */
export type BadgeCourseOption = {
  id: string;
  title: string;
};

/** Human-readable "cara mendapat" derived from trigger/threshold/course. */
export function describeBadgeHowTo(
  trigger: BadgeTriggerKey,
  threshold: number,
  courseTitle: string | null,
): string {
  switch (trigger) {
    case "LEVEL_REACHED":
      return `Capai Level ${threshold}.`;
    case "COURSES_COMPLETED":
      return `Selesaikan ${threshold} kursus berbeda hingga 100%.`;
    case "COURSE_SPECIFIC":
      return courseTitle
        ? `Selesaikan kursus "${courseTitle}" hingga 100%.`
        : "Selesaikan kursus tertentu hingga 100%.";
  }
}

export function adminBadgesKey(params: AdminBadgesParams) {
  return ["admin", "badges", params] as const;
}

export function parseTrigger(value: string | null | undefined): TriggerFilter {
  return TRIGGER_FILTERS.includes(value as TriggerFilter)
    ? (value as TriggerFilter)
    : "all";
}

export function parsePage(value: string | null | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearch(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, 100);
}
