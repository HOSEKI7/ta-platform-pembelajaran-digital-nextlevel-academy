import "server-only";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type {
  BatchFormInput,
  ClassCreateInput,
  ClassUpdateInput,
  FieldCreateInput,
  FieldUpdateInput,
} from "@/lib/validations/admin-internship-config";

/**
 * Server-side write operations for the admin "Konfigurasi Magang" surface
 * (Batch / Bidang / Kelas — PRD §6.9 / §5.3). Centralises create / update /
 * delete + AuditLog so the route handlers stay thin.
 *
 * Invariants enforced here:
 * - Field name is unique per batch (`@@unique([batchId, name])`) → P2002 maps to
 *   a friendly "duplicate".
 * - Class name is the globally-unique composite "<Batch> - <Field> - <Letter>".
 *   The trailing letter is server-assigned (next free A..Z within the field).
 * - Renaming a batch/field cascades the child class composite names (in-tx) so
 *   the stored names stay consistent with the live hierarchy.
 * - Delete is guarded (409) whenever an entity still has descendants/usage; the
 *   admin must empty it first.
 */

export type AdminActionContext = { actorId: string };

export type ConfigWriteFailure =
  | "not_found"
  | "duplicate"
  | "in_use"
  | "batch_not_found"
  | "field_not_found"
  | "field_batch_mismatch"
  | "classes_full"
  | "error";

export type ConfigWriteResult =
  | { ok: true; id: string }
  | { ok: false; reason: ConfigWriteFailure; counts?: Record<string, number> };

/** Duck-typed Prisma unique-constraint check — `instanceof` is unreliable here. */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

/** "YYYY-MM-DD" → UTC midnight (matches the @db.Date storage convention). */
function toUtcMidnight(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Trailing segment of a composite class name → its letter. */
function classLetter(name: string): string {
  return name.split(" - ").pop()?.trim() || name;
}

function composeClassName(
  batchName: string,
  fieldName: string,
  letter: string,
): string {
  return `${batchName} - ${fieldName} - ${letter}`;
}

/** Next free class letter (A..Z) within a field, or null when past Z. */
function nextLetter(existingNames: string[]): string | null {
  let max = 64; // 'A' - 1
  for (const n of existingNames) {
    const seg = classLetter(n);
    if (seg.length === 1) {
      const code = seg.toUpperCase().charCodeAt(0);
      if (code >= 65 && code <= 90 && code > max) max = code;
    }
  }
  const next = max + 1;
  return next > 90 ? null : String.fromCharCode(next);
}

function audit(
  ctx: AdminActionContext,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Prisma.InputJsonValue,
) {
  return {
    actorId: ctx.actorId,
    action,
    entityType,
    entityId,
    metadata,
  };
}

// ===== Batch =================================================================

export async function createBatch(
  input: BatchFormInput,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const data = {
    name: input.name.trim(),
    description: input.description.trim(),
    startDate: toUtcMidnight(input.startDate),
    endDate: toUtcMidnight(input.endDate),
  };
  try {
    const created = await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.create({ data, select: { id: true } });
      await tx.auditLog.create({
        data: audit(ctx, "BATCH_CREATE", "Batch", batch.id, { name: data.name }),
      });
      return batch;
    });
    return { ok: true, id: created.id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[createBatch] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function updateBatch(
  id: string,
  input: BatchFormInput,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const existing = await prisma.batch.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const data = {
    name: input.name.trim(),
    description: input.description.trim(),
    startDate: toUtcMidnight(input.startDate),
    endDate: toUtcMidnight(input.endDate),
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.batch.update({ where: { id }, data });
      // Cascade composite class names when the batch is renamed.
      if (data.name !== existing.name) {
        const classes = await tx.class.findMany({
          where: { field: { batchId: id } },
          select: { id: true, name: true, field: { select: { name: true } } },
        });
        for (const c of classes) {
          await tx.class.update({
            where: { id: c.id },
            data: {
              name: composeClassName(data.name, c.field.name, classLetter(c.name)),
            },
          });
        }
      }
      await tx.auditLog.create({
        data: audit(ctx, "BATCH_UPDATE", "Batch", id, { name: data.name }),
      });
    });
    return { ok: true, id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[updateBatch] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function deleteBatch(
  id: string,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const existing = await prisma.batch.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { fields: true, tasks: true } } },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const { fields, tasks } = existing._count;
  if (fields > 0 || tasks > 0) {
    return { ok: false, reason: "in_use", counts: { fields, tasks } };
  }

  try {
    await prisma.$transaction([
      prisma.batch.delete({ where: { id } }),
      prisma.auditLog.create({
        data: audit(ctx, "BATCH_DELETE", "Batch", id, { name: existing.name }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[deleteBatch] failed", err);
    return { ok: false, reason: "error" };
  }
}

// ===== Bidang (Field) ========================================================

export async function createField(
  input: FieldCreateInput,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const batch = await prisma.batch.findUnique({
    where: { id: input.batchId },
    select: { id: true },
  });
  if (!batch) return { ok: false, reason: "batch_not_found" };

  const name = input.name.trim();
  try {
    const created = await prisma.$transaction(async (tx) => {
      const field = await tx.field.create({
        data: { batchId: input.batchId, name },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: audit(ctx, "FIELD_CREATE", "Field", field.id, {
          name,
          batchId: input.batchId,
        }),
      });
      return field;
    });
    return { ok: true, id: created.id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[createField] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function updateField(
  id: string,
  input: FieldUpdateInput,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const existing = await prisma.field.findUnique({
    where: { id },
    select: { id: true, name: true, batch: { select: { name: true } } },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const name = input.name.trim();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.field.update({ where: { id }, data: { name } });
      // Cascade composite class names when the field is renamed.
      if (name !== existing.name) {
        const classes = await tx.class.findMany({
          where: { fieldId: id },
          select: { id: true, name: true },
        });
        for (const c of classes) {
          await tx.class.update({
            where: { id: c.id },
            data: {
              name: composeClassName(existing.batch.name, name, classLetter(c.name)),
            },
          });
        }
      }
      await tx.auditLog.create({
        data: audit(ctx, "FIELD_UPDATE", "Field", id, { name }),
      });
    });
    return { ok: true, id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[updateField] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function deleteField(
  id: string,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const existing = await prisma.field.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { classes: true, tasks: true } } },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const { classes, tasks } = existing._count;
  if (classes > 0 || tasks > 0) {
    return { ok: false, reason: "in_use", counts: { classes, tasks } };
  }

  try {
    await prisma.$transaction([
      prisma.field.delete({ where: { id } }),
      prisma.auditLog.create({
        data: audit(ctx, "FIELD_DELETE", "Field", id, { name: existing.name }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[deleteField] failed", err);
    return { ok: false, reason: "error" };
  }
}

// ===== Kelas (Class) =========================================================

export async function createClass(
  input: ClassCreateInput,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const field = await prisma.field.findUnique({
    where: { id: input.fieldId },
    select: { id: true, name: true, batchId: true, batch: { select: { name: true } } },
  });
  if (!field) return { ok: false, reason: "field_not_found" };
  if (field.batchId !== input.batchId) {
    return { ok: false, reason: "field_batch_mismatch" };
  }

  const siblings = await prisma.class.findMany({
    where: { fieldId: field.id },
    select: { name: true },
  });
  const letter = nextLetter(siblings.map((s) => s.name));
  if (!letter) return { ok: false, reason: "classes_full" };

  const name = composeClassName(field.batch.name, field.name, letter);
  try {
    const created = await prisma.$transaction(async (tx) => {
      const cls = await tx.class.create({
        data: { fieldId: field.id, name },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: audit(ctx, "CLASS_CREATE", "Class", cls.id, { name, letter }),
      });
      return cls;
    });
    return { ok: true, id: created.id };
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, reason: "duplicate" };
    console.error("[createClass] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function updateClass(
  id: string,
  input: ClassUpdateInput,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const existing = await prisma.class.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { internshipProfiles: true } } },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  // Capacity can't drop below the already-enrolled count.
  if (input.maxStudents < existing._count.internshipProfiles) {
    return {
      ok: false,
      reason: "in_use",
      counts: { internshipProfiles: existing._count.internshipProfiles },
    };
  }

  try {
    await prisma.$transaction([
      prisma.class.update({ where: { id }, data: { maxStudents: input.maxStudents } }),
      prisma.auditLog.create({
        data: audit(ctx, "CLASS_UPDATE", "Class", id, {
          name: existing.name,
          maxStudents: input.maxStudents,
        }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[updateClass] failed", err);
    return { ok: false, reason: "error" };
  }
}

export async function deleteClass(
  id: string,
  ctx: AdminActionContext,
): Promise<ConfigWriteResult> {
  const existing = await prisma.class.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: {
        select: { internshipProfiles: true, mentorProfiles: true, tasks: true },
      },
    },
  });
  if (!existing) return { ok: false, reason: "not_found" };

  const { internshipProfiles, mentorProfiles, tasks } = existing._count;
  if (internshipProfiles > 0 || mentorProfiles > 0 || tasks > 0) {
    return {
      ok: false,
      reason: "in_use",
      counts: { internshipProfiles, mentorProfiles, tasks },
    };
  }

  try {
    await prisma.$transaction([
      prisma.class.delete({ where: { id } }),
      prisma.auditLog.create({
        data: audit(ctx, "CLASS_DELETE", "Class", id, { name: existing.name }),
      }),
    ]);
    return { ok: true, id };
  } catch (err) {
    console.error("[deleteClass] failed", err);
    return { ok: false, reason: "error" };
  }
}

// ===== Failure → HTTP mapping ===============================================

type Failure = { reason: ConfigWriteFailure; counts?: Record<string, number> };

export function describeBatchFailure(r: Failure): { status: number; error: string } {
  switch (r.reason) {
    case "not_found":
      return { status: 404, error: "Batch tidak ditemukan." };
    case "duplicate":
      return { status: 409, error: "Nama batch sudah digunakan." };
    case "in_use": {
      const f = r.counts?.fields ?? 0;
      const t = r.counts?.tasks ?? 0;
      const parts: string[] = [];
      if (f) parts.push(`${f} bidang`);
      if (t) parts.push(`${t} tugas`);
      return {
        status: 409,
        error: `Batch tidak bisa dihapus karena masih terhubung/memiliki ${parts.join(" dan ")}. Hapus atau pindahkan dulu seluruh bidang di batch ini.`,
      };
    }
    default:
      return { status: 500, error: "Gagal memproses batch. Coba lagi." };
  }
}

export function describeFieldFailure(r: Failure): { status: number; error: string } {
  switch (r.reason) {
    case "not_found":
      return { status: 404, error: "Bidang tidak ditemukan." };
    case "batch_not_found":
      return { status: 404, error: "Batch tidak ditemukan." };
    case "duplicate":
      return { status: 409, error: "Nama bidang sudah digunakan di batch ini." };
    case "in_use": {
      const c = r.counts?.classes ?? 0;
      const t = r.counts?.tasks ?? 0;
      const parts: string[] = [];
      if (c) parts.push(`${c} kelas`);
      if (t) parts.push(`${t} tugas`);
      return {
        status: 409,
        error: `Bidang tidak bisa dihapus karena masih memiliki ${parts.join(" dan ")}. Hapus dulu kelas di bidang ini.`,
      };
    }
    default:
      return { status: 500, error: "Gagal memproses bidang. Coba lagi." };
  }
}

export function describeClassFailure(r: Failure): { status: number; error: string } {
  switch (r.reason) {
    case "not_found":
      return { status: 404, error: "Kelas tidak ditemukan." };
    case "field_not_found":
      return { status: 404, error: "Bidang tidak ditemukan." };
    case "field_batch_mismatch":
      return { status: 400, error: "Bidang tidak berada di batch yang dipilih." };
    case "classes_full":
      return { status: 409, error: "Kelas sudah penuh (maksimal hingga huruf Z)." };
    case "duplicate":
      return { status: 409, error: "Kelas sudah ada." };
    case "in_use": {
      const s = r.counts?.internshipProfiles ?? 0;
      const m = r.counts?.mentorProfiles ?? 0;
      const t = r.counts?.tasks ?? 0;
      if (s > 0 && m === 0 && t === 0) {
        // Also used by the capacity-below-enrolled guard on update.
        return {
          status: 409,
          error: `Kelas masih memiliki ${s} peserta. Kapasitas tidak boleh di bawah jumlah peserta, dan kelas tidak bisa dihapus selama masih ada peserta.`,
        };
      }
      const parts: string[] = [];
      if (s) parts.push(`${s} peserta`);
      if (m) parts.push(`${m} mentor`);
      if (t) parts.push(`${t} tugas`);
      return {
        status: 409,
        error: `Kelas tidak bisa dihapus karena masih memiliki ${parts.join(" dan ")}. Pindahkan dulu sebelum menghapus.`,
      };
    }
    default:
      return { status: 500, error: "Gagal memproses kelas. Coba lagi." };
  }
}
