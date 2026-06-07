import "server-only";

import { resolveCourseImageUrl } from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";
import { type ExpProgress, expProgress } from "@/lib/game-formula";

export type GameProfileDTO = {
  level: number;
  exp: number;
  totalExp: number;
  expToNext: ExpProgress;
};

export async function loadGameProfile(userId: string): Promise<GameProfileDTO> {
  const profile = await prisma.userGameProfile.findUnique({
    where: { userId },
    select: { level: true, exp: true, totalExp: true },
  });

  const level = profile?.level ?? 1;
  const exp = profile?.exp ?? 0;
  const totalExp = profile?.totalExp ?? 0;

  return {
    level,
    exp,
    totalExp,
    expToNext: expProgress({ level, exp }),
  };
}

export type DashboardStatsDTO = {
  totalCourses: number;
  inProgress: number;
  certificates: number;
};

export async function loadDashboardStats(userId: string): Promise<DashboardStatsDTO> {
  const [totalCourses, inProgress, certificates] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.enrollment.count({
      where: { userId, progressPct: { gt: 0, lt: 100 } },
    }),
    prisma.certificate.count({ where: { userId } }),
  ]);

  return { totalCourses, inProgress, certificates };
}

export type StudentCourseCardDTO = {
  enrollmentId: string;
  progressPct: number;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    instructor: string;
    estimatedDuration: number | null;
    category: { name: string };
  };
};

export async function loadInProgressCourses(
  userId: string,
): Promise<{ courses: StudentCourseCardDTO[] }> {
  const rows = await prisma.enrollment.findMany({
    where: { userId, progressPct: { gt: 0, lt: 100 } },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: true,
          estimatedDuration: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return {
    courses: rows.map((r) => ({
      enrollmentId: r.id,
      progressPct: r.progressPct,
      course: {
        id: r.course.id,
        title: r.course.title,
        slug: r.course.slug,
        thumbnailUrl: resolveCourseImageUrl(r.course.thumbnailUrl),
        instructor: r.course.instructor,
        estimatedDuration: r.course.estimatedDuration,
        category: { name: r.course.category.name },
      },
    })),
  };
}

export type MyCoursesStatus = "all" | "in-progress" | "completed";

export type MyCoursesFilters = {
  search: string;
  status: MyCoursesStatus;
};

/**
 * Loads every enrollment owned by a student for the "Kursus Saya" page.
 * Sort prefers `lastAccessedAt` (bumped on each /learn/:slug page-load via
 * `touchEnrollment`) and falls back to `enrolledAt` for rows the student has
 * not opened yet. PRD §6.5.1 + §6.5.8.
 */
export async function loadMyCourses(
  userId: string,
  filters: MyCoursesFilters,
): Promise<{ courses: StudentCourseCardDTO[] }> {
  const trimmedSearch = filters.search.trim();

  const progressFilter =
    filters.status === "in-progress"
      ? { progressPct: { lt: 100 } }
      : filters.status === "completed"
        ? { progressPct: 100 }
        : {};

  const rows = await prisma.enrollment.findMany({
    where: {
      userId,
      ...progressFilter,
      ...(trimmedSearch.length > 0
        ? {
            course: {
              title: { contains: trimmedSearch, mode: "insensitive" as const },
            },
          }
        : {}),
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: true,
          estimatedDuration: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: [
      { lastAccessedAt: { sort: "desc", nulls: "last" } },
      { enrolledAt: "desc" },
    ],
    take: 60,
  });

  return {
    courses: rows.map((r) => ({
      enrollmentId: r.id,
      progressPct: r.progressPct,
      course: {
        id: r.course.id,
        title: r.course.title,
        slug: r.course.slug,
        thumbnailUrl: resolveCourseImageUrl(r.course.thumbnailUrl),
        instructor: r.course.instructor,
        estimatedDuration: r.course.estimatedDuration,
        category: { name: r.course.category.name },
      },
    })),
  };
}

/**
 * Bumps `Enrollment.lastAccessedAt` so the row floats to the top of "Kursus
 * Saya". Call from `/learn/:slug` page-load (or first video play) — not from
 * write hooks, since this is a per-view signal. Idempotent and cheap.
 */
export async function touchEnrollment(
  userId: string,
  courseId: string,
): Promise<void> {
  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: { lastAccessedAt: new Date() },
  });
}

export type RecommendedCourseDTO = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  shortDescription: string | null;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  instructor: string;
  category: { name: string };
};

export async function loadRecommendedCourses(
  userId: string,
): Promise<{ courses: RecommendedCourseDTO[] }> {
  const enrolledIds = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const exclude = enrolledIds.map((e) => e.courseId);

  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(exclude.length > 0 ? { id: { notIn: exclude } } : {}),
    },
    include: { category: { select: { name: true } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  return {
    courses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnailUrl: resolveCourseImageUrl(c.thumbnailUrl),
      shortDescription: c.shortDescription,
      price: c.price,
      fakePrice: c.fakePrice,
      estimatedDuration: c.estimatedDuration,
      instructor: c.instructor,
      category: { name: c.category.name },
    })),
  };
}

export type NotificationDTO = {
  id: string;
  title: string;
  message: string;
  type: string;
  refId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsDTO = {
  items: NotificationDTO[];
  unreadCount: number;
};

export async function loadNotifications(userId: string): Promise<NotificationsDTO> {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    items: items.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      refId: n.refId,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function markAllNotificationsRead(
  userId: string,
): Promise<{ updatedCount: number }> {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updatedCount: result.count };
}
