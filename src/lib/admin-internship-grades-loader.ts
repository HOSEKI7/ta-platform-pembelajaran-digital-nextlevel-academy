import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { resolveGradeBand } from "@/components/internship/final-grade/final-grade-helpers";
import {
  PAGE_SIZE,
  type AdminGradeListParams,
  type AdminGradeListResult,
  type AdminGradeRow,
} from "@/lib/admin-internship-grades-query";

/**
 * Read-side loader for the admin Nilai Akhir surface (PRD §6.11.9 / §6.9.4).
 * Unlike the mentor grade loader, this is NOT scoped to a single class — the
 * admin oversees every intern across all classes. One page of the roster
 * (`internshipProfile`) with each intern's `FinalGrade` left-joined through the
 * user relation (so ungraded interns still appear) — no N+1.
 */

/** "Batch - Bidang - Kelas" label. Field/Class names embed the batch prefix
 *  (e.g. "Batch 1 - Web Programming - A"), so strip it to the meaningful tail —
 *  mirrors the attendance/tasks loaders. */
type ClassWithChain = {
  name: string;
  field: { name: string; batch: { name: string } };
};
function classLabel(cls: ClassWithChain): string {
  const field = cls.field.name.split(" - ").slice(1).join(" - ") || cls.field.name;
  const section = cls.name.split(" - ").pop() ?? cls.name;
  return `${cls.field.batch.name} - ${field} - ${section}`;
}

const classChainSelect = {
  name: true,
  field: {
    select: { name: true, batch: { select: { name: true } } },
  },
} satisfies Prisma.ClassSelect;

/** Class-scoped `where` from the (optional) batch/field/class filter ids. */
function classFilter(
  params: Pick<AdminGradeListParams, "batchId" | "fieldId" | "classId">,
): Prisma.ClassWhereInput {
  return {
    ...(params.classId ? { id: params.classId } : {}),
    ...(params.fieldId ? { fieldId: params.fieldId } : {}),
    ...(params.batchId ? { field: { batchId: params.batchId } } : {}),
  };
}

export async function loadAdminGradeList(
  params: AdminGradeListParams,
): Promise<AdminGradeListResult> {
  const { search, page } = params;

  const where: Prisma.InternshipProfileWhereInput = {
    class: classFilter(params),
    user: {
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
  };

  const skip = (page - 1) * PAGE_SIZE;
  const [total, profiles] = await Promise.all([
    prisma.internshipProfile.count({ where }),
    prisma.internshipProfile.findMany({
      where,
      select: {
        institution: true,
        class: { select: classChainSelect },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            finalGradeAsStudent: { select: { grade: true, gradedAt: true } },
          },
        },
      },
      orderBy: { user: { name: "asc" } },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const rows: AdminGradeRow[] = profiles.map((p) => {
    const grade = p.user.finalGradeAsStudent?.grade ?? null;
    return {
      studentId: p.user.id,
      name: p.user.name,
      image: p.user.image,
      classLabel: classLabel(p.class),
      institution: p.institution,
      grade,
      letter: grade === null ? null : resolveGradeBand(grade).letter,
      gradedAtISO: p.user.finalGradeAsStudent?.gradedAt?.toISOString() ?? null,
    };
  });

  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
