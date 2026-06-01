import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { internshipClassLabel } from "@/lib/internship-naming";

import {
  PAGE_SIZE,
  type AdminUsersParams,
  type AdminUsersResult,
  type ClassOption,
} from "./admin-users-query";

/**
 * Loads one page of the admin User Management table (PRD §6.11.4).
 *
 * Performance shape:
 * - 2 parallel queries (count + findMany) for the page slice.
 *
 * Soft-deleted users (`deletedAt != null`) are always excluded.
 */
export async function loadAdminUsersPage(
  params: AdminUsersParams,
): Promise<AdminUsersResult> {
  const { page, role, status, search, sort } = params;

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(role !== "all" ? { role } : {}),
    ...(status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        internshipProfile: { select: { institution: true } },
      },
      orderBy: { createdAt: sort === "created_asc" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      institution: u.internshipProfile?.institution ?? null,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/**
 * All classes for the create/edit form dropdown. The label already encodes
 * Batch + Field + Class (PRD §6.11.4); `studentCount`/`maxStudents` drive the
 * intern-quota indicator. Ordered by full label so batches group together.
 */
export async function loadClassOptions(): Promise<ClassOption[]> {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      maxStudents: true,
      field: { select: { name: true, batch: { select: { name: true } } } },
      _count: { select: { internshipProfiles: true } },
    },
    orderBy: [
      { field: { batch: { name: "asc" } } },
      { field: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return classes.map((c) => ({
    id: c.id,
    label: internshipClassLabel({
      batchName: c.field.batch.name,
      fieldName: c.field.name,
      className: c.name,
    }),
    studentCount: c._count.internshipProfiles,
    maxStudents: c.maxStudents,
  }));
}

/**
 * Loads a single user for the Edit page (all roles). Returns null when the user
 * does not exist or has been soft-deleted. Includes the assigned class id +
 * institution so the form can pre-fill class/institution for magang/mentor.
 */
export async function loadUserForEdit(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
      internshipProfile: { select: { classId: true, institution: true } },
      mentorProfile: { select: { classId: true } },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
    classId:
      user.internshipProfile?.classId ?? user.mentorProfile?.classId ?? null,
    institution: user.internshipProfile?.institution ?? null,
  };
}

export type AdminUserEditData = NonNullable<
  Awaited<ReturnType<typeof loadUserForEdit>>
>;
