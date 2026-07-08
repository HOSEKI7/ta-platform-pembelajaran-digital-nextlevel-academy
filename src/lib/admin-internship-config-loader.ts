import "server-only";

import { prisma } from "@/lib/prisma";
import { classLetter } from "@/lib/internship-naming";
import type {
  BatchRow,
  ClassRow,
  FieldRow,
  InternshipConfigData,
} from "@/lib/admin-internship-config-query";

/**
 * Data loader for the admin "Konfigurasi Magang" surface (PRD §6.9 / §5.3).
 * Server-only. The three lists are small, so we fetch them whole in three
 * parallel queries (with nested `_count` to avoid N+1) and let the view sort
 * client-side. Result is JSON-serialisable for TanStack hydration.
 */

/** `@db.Date` columns are stored as UTC midnight → format back as "YYYY-MM-DD". */
function dbDateToISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function loadInternshipConfig(): Promise<InternshipConfigData> {
  const [batches, fields, classes] = await Promise.all([
    prisma.batch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        kode_batch: true,
        description: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        _count: { select: { fields: true } },
      },
    }),
    prisma.field.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        kode_bidang: true,
        batchId: true,
        createdAt: true,
        batch: { select: { name: true } },
        _count: { select: { classes: true } },
      },
    }),
    prisma.class.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        maxStudents: true,
        createdAt: true,
        fieldId: true,
        field: {
          select: { name: true, batchId: true, batch: { select: { name: true } } },
        },
        _count: { select: { internshipProfiles: true } },
      },
    }),
  ]);

  const batchRows: BatchRow[] = batches.map((b) => ({
    id: b.id,
    name: b.name,
    kodeBatch: b.kode_batch,
    description: b.description,
    startDate: dbDateToISO(b.startDate),
    endDate: dbDateToISO(b.endDate),
    fieldCount: b._count.fields,
    createdAt: b.createdAt.toISOString(),
  }));

  const fieldRows: FieldRow[] = fields.map((f) => ({
    id: f.id,
    name: f.name,
    kodeBidang: f.kode_bidang,
    batchId: f.batchId,
    batchName: f.batch.name,
    classCount: f._count.classes,
    createdAt: f.createdAt.toISOString(),
  }));

  const classRows: ClassRow[] = classes.map((c) => ({
    id: c.id,
    name: c.name,
    letter: classLetter(c.name),
    fieldId: c.fieldId,
    fieldName: c.field.name,
    batchId: c.field.batchId,
    batchName: c.field.batch.name,
    maxStudents: c.maxStudents,
    studentCount: c._count.internshipProfiles,
    createdAt: c.createdAt.toISOString(),
  }));

  return { batches: batchRows, fields: fieldRows, classes: classRows };
}
