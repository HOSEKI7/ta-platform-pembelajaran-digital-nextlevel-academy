import "server-only";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { resolveBadgeIconUrl } from "@/lib/bunny-storage";
import {
  type AdminBadgesParams,
  type AdminBadgesResult,
  type AdminBadgeRow,
  type BadgeCourseOption,
  PAGE_SIZE,
  type TriggerFilter,
  describeBadgeHowTo,
} from "@/lib/admin-badges-query";
import type { BadgeTriggerKey } from "@/lib/gamification-types";

/**
 * Data loader for the admin Badge Management list (PRD §6.11.8). Server-only —
 * mirror of the vouchers/certificates loaders: filtering + pagination run in
 * SQL, the result is JSON-serialisable for TanStack hydration. The route
 * handler and the page both call this.
 */

function buildWhere(
  search: string,
  trigger: TriggerFilter,
): Prisma.BadgeWhereInput {
  const and: Prisma.BadgeWhereInput[] = [];
  if (search) {
    and.push({ name: { contains: search, mode: "insensitive" } });
  }
  if (trigger !== "all") {
    and.push({ trigger });
  }
  return and.length > 0 ? { AND: and } : {};
}

export async function loadAdminBadgesPage(
  params: AdminBadgesParams,
): Promise<AdminBadgesResult> {
  const where = buildWhere(params.search, params.trigger);
  const page = Math.max(1, params.page);

  const [total, rows] = await Promise.all([
    prisma.badge.count({ where }),
    prisma.badge.findMany({
      where,
      orderBy: [{ trigger: "asc" }, { threshold: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        description: true,
        trigger: true,
        threshold: true,
        courseId: true,
        expMinimum: true,
        logoUrl: true,
        course: { select: { title: true } },
        _count: { select: { earnings: true } },
      },
    }),
  ]);

  const pageRows: AdminBadgeRow[] = rows.map((b) => {
    const trigger = b.trigger as BadgeTriggerKey;
    const courseTitle = b.course?.title ?? null;
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      trigger,
      threshold: b.threshold,
      courseId: b.courseId,
      courseTitle,
      expMinimum: b.expMinimum,
      logoUrl: resolveBadgeIconUrl(b.logoUrl),
      logoStored: b.logoUrl,
      earnedCount: b._count.earnings,
      howToEarn:
        b.description?.trim() ||
        describeBadgeHowTo(trigger, b.threshold, courseTitle),
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { rows: pageRows, total, page, pageSize: PAGE_SIZE, totalPages };
}

/** Course options for the COURSE_SPECIFIC dropdown, ordered by title. */
export async function listBadgeCourseOptions(): Promise<BadgeCourseOption[]> {
  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  return courses;
}
