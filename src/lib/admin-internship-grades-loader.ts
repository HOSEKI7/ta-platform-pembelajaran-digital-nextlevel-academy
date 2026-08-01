import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { internshipClassLabel } from "@/lib/internship-naming";
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

/** "Batch - Bidang - Kelas" label assembled from each name part (see
 *  `internshipClassLabel`) — mirrors the attendance/tasks loaders. */
type ClassWithChain = {
  name: string;
  field: { name: string; batch: { name: string } };
};
function classLabel(cls: ClassWithChain): string {
  return internshipClassLabel({
    batchName: cls.field.batch.name,
    fieldName: cls.field.name,
    className: cls.name,
  });
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
            finalGradeAsStudent: {
              select: { grade: true, gradedAt: true, isLocked: true },
            },
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
      isLocked: p.user.finalGradeAsStudent?.isLocked ?? false,
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
