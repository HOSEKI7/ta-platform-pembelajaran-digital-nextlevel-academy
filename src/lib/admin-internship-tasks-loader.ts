import "server-only";

import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { resolveTaskFileUrl } from "@/lib/bunny-storage";
import { signTaskDescriptionImages } from "@/lib/task-description";
import { formatFileSize } from "@/components/internship/tasks/task-helpers";
import type { TaskDisplayStatus } from "@/lib/internship-task-types";
import {
  PAGE_SIZE,
  type AdminSubmissionRow,
  type AdminTaskDetail,
  type AdminTaskListParams,
  type AdminTaskListResult,
  type AdminTaskRow,
  type AdminTaskStatus,
} from "@/lib/admin-internship-tasks-query";

const WIB_TZ = "Asia/Jakarta";

/**
 * Read-side loaders for the admin Tugas surface (PRD §6.11 / §6.9.3). Unlike the
 * mentor loaders, these are NOT scoped to a single class — the admin oversees
 * every class. Soft-delete is not modelled on `Task`, so no `deletedAt` filter.
 */

/** "Batch - Bidang - Kelas" label from a nested class include. Mirrors the
 *  attendance loader: Field/Class names embed the batch prefix, so strip it. */
type ClassWithChain = {
  name: string;
  field: { name: string; batch: { name: string; startDate: Date; endDate: Date } };
};
function classLabel(cls: ClassWithChain): string {
  const field = cls.field.name.split(" - ").slice(1).join(" - ") || cls.field.name;
  const section = cls.name.split(" - ").pop() ?? cls.name;
  return `${cls.field.batch.name} - ${field} - ${section}`;
}

const classChainSelect = {
  name: true,
  field: {
    select: {
      name: true,
      batch: { select: { name: true, startDate: true, endDate: true } },
    },
  },
} satisfies Prisma.ClassSelect;

function lastSegmentOfPath(s: string): string {
  const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
  return idx === -1 ? s : s.slice(idx + 1);
}

// ---- list -------------------------------------------------------------------

/**
 * One page of the task list across all classes. Status (AKTIF/OVERDUE) is a pure
 * deadline-vs-now classification computed against a single server `now`, applied
 * both as the DB filter and the per-row label so pagination stays correct.
 */
export async function loadAdminTaskList(
  params: AdminTaskListParams,
): Promise<AdminTaskListResult> {
  const { search, batchId, fieldId, classId, status, page } = params;
  const now = new Date();

  const where: Prisma.TaskWhereInput = {
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    // Task carries batch/field/class ids directly — filter without joins.
    ...(classId ? { classId } : {}),
    ...(fieldId ? { fieldId } : {}),
    ...(batchId ? { batchId } : {}),
    ...(status === "AKTIF" ? { deadline: { gte: now } } : {}),
    ...(status === "OVERDUE" ? { deadline: { lt: now } } : {}),
  };

  const skip = (page - 1) * PAGE_SIZE;
  const [total, rows] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        createdAt: true,
        deadline: true,
        class: { select: classChainSelect },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const mapped: AdminTaskRow[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    classLabel: classLabel(t.class),
    createdAtISO: t.createdAt.toISOString(),
    deadlineISO: t.deadline.toISOString(),
    status: (t.deadline.getTime() >= now.getTime()
      ? "AKTIF"
      : "OVERDUE") as AdminTaskStatus,
  }));

  return {
    rows: mapped,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    serverNowISO: now.toISOString(),
  };
}

// ---- detail (task + full class submission roster) ---------------------------

type TaskRowForDetail = {
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
};
function resolveAttachment(row: TaskRowForDetail) {
  if (!row.attachmentUrl) return null;
  return {
    name: row.attachmentName ?? lastSegmentOfPath(row.attachmentUrl),
    sizeLabel: row.attachmentSize ? formatFileSize(row.attachmentSize) : "—",
    url: resolveTaskFileUrl(row.attachmentUrl),
  };
}

/**
 * One task (any class) plus every student in its class with their submission
 * row. Status derivation matches the mentor loader: SUBMITTED→TERKUMPUL ·
 * NOT_SUBMITTED+feedback→DIKEMBALIKAN · else past-deadline→TERLEWAT / BELUM.
 * `rawStatus` carries the stored SUBMITTED/NOT_SUBMITTED so the UI knows which
 * force-toggle to show. `null` when the task id doesn't exist (page → 404).
 */
export async function loadAdminTaskDetail(
  taskId: string,
): Promise<AdminTaskDetail | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      classId: true,
      title: true,
      description: true,
      createdAt: true,
      deadline: true,
      attachmentUrl: true,
      attachmentName: true,
      attachmentSize: true,
      class: { select: classChainSelect },
      submissions: {
        select: {
          studentId: true,
          status: true,
          submissionUrl: true,
          submissionFileName: true,
          submissionFileSize: true,
          submittedAt: true,
          feedbackText: true,
        },
      },
    },
  });
  if (!task) return null;

  const students = await prisma.internshipProfile.findMany({
    where: { classId: task.classId },
    select: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { user: { name: "asc" } },
  });

  const now = new Date();
  const overdue = task.deadline.getTime() < now.getTime();
  const byStudent = new Map(task.submissions.map((s) => [s.studentId, s]));

  let terkumpul = 0;
  const rows: AdminSubmissionRow[] = students.map(({ user }) => {
    const sub = byStudent.get(user.id) ?? null;

    let status: TaskDisplayStatus;
    if (sub?.status === "SUBMITTED") status = "TERKUMPUL";
    else if (sub?.feedbackText) status = "DIKEMBALIKAN";
    else status = overdue ? "TERLEWAT" : "BELUM";
    if (status === "TERKUMPUL") terkumpul += 1;

    const file = sub?.submissionUrl
      ? {
          name: sub.submissionFileName ?? "Berkas",
          sizeLabel: sub.submissionFileSize
            ? formatFileSize(sub.submissionFileSize)
            : "—",
          url: resolveTaskFileUrl(sub.submissionUrl),
        }
      : null;

    return {
      studentId: user.id,
      name: user.name,
      image: user.image,
      status,
      rawStatus: sub?.status === "SUBMITTED" ? "SUBMITTED" : "NOT_SUBMITTED",
      submittedAtISO: sub?.submittedAt ? sub.submittedAt.toISOString() : null,
      file,
    };
  });

  return {
    task: {
      id: task.id,
      title: task.title,
      descriptionHtml: signTaskDescriptionImages(task.description),
      deadlineISO: task.deadline.toISOString(),
      createdAtISO: task.createdAt.toISOString(),
      classLabel: classLabel(task.class),
      attachment: resolveAttachment(task),
    },
    rows,
    summary: { terkumpul, total: students.length },
    serverNowISO: now.toISOString(),
  };
}

// ---- edit prefill -----------------------------------------------------------

export type AdminTaskEditData = {
  classLabel: string;
  period: { startISO: string; endISO: string };
  task: {
    id: string;
    title: string;
    descriptionHtml: string;
    /** Wall-clock WIB "yyyy-MM-ddTHH:mm" for the picker. */
    deadlineWib: string;
    attachment: { name: string; sizeLabel: string } | null;
  };
};

function dbDateToISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Task fields prefilled for the admin edit form. `null` when the task is gone. */
export async function loadAdminTaskForEdit(
  taskId: string,
): Promise<AdminTaskEditData | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      attachmentUrl: true,
      attachmentName: true,
      attachmentSize: true,
      class: { select: classChainSelect },
    },
  });
  if (!task) return null;

  const batch = task.class.field.batch;
  return {
    classLabel: classLabel(task.class),
    period: { startISO: dbDateToISO(batch.startDate), endISO: dbDateToISO(batch.endDate) },
    task: {
      id: task.id,
      title: task.title,
      descriptionHtml: signTaskDescriptionImages(task.description),
      deadlineWib: formatInTimeZone(task.deadline, WIB_TZ, "yyyy-MM-dd'T'HH:mm"),
      attachment: task.attachmentUrl
        ? {
            name: task.attachmentName ?? "Lampiran",
            sizeLabel: task.attachmentSize ? formatFileSize(task.attachmentSize) : "—",
          }
        : null,
    },
  };
}
