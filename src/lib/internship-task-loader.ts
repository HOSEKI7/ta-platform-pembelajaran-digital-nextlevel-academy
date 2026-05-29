import "server-only";

import { prisma } from "@/lib/prisma";
import { isExternalUrl, resolveTaskFileUrl } from "@/lib/bunny-storage";
import { signTaskDescriptionImages } from "@/lib/task-description";
import { formatFileSize } from "@/components/internship/tasks/task-helpers";
import type {
  AttachmentKind,
  MagangTask,
  MentorFeedback,
  SubmittedFile,
  TaskAttachment,
  TaskBaseStatus,
} from "@/lib/internship-task-types";

/**
 * Read-side loaders for the Peserta-Magang Tugas surface. One Prisma query per
 * function (no N+1), with mentor + the user's own TaskSubmission included.
 * Signing of file URLs is synchronous (sha256), so no extra Promise.all
 * round-trip is needed.
 *
 * Returns `null` when the user has no InternshipProfile yet (admin hasn't
 * placed them in a class) — the caller renders an empty state. For the detail
 * function, `null` also covers "task not in the user's class" (treated as 404
 * by the page).
 */

function inferAttachmentKind(name: string): AttachmentKind {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "docx";
  if (lower.endsWith(".zip")) return "zip";
  return "image";
}

function lastSegmentOfPath(s: string): string {
  const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
  return idx === -1 ? s : s.slice(idx + 1);
}

type TaskRow = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  mentor: { name: string };
  submissions: {
    status: "NOT_SUBMITTED" | "SUBMITTED";
    submissionUrl: string | null;
    submissionFileName: string | null;
    submissionFileSize: number | null;
    feedbackText: string | null;
    reviewedAt: Date | null;
    submittedAt: Date;
    updatedAt: Date;
  }[];
};

function mapToMagangTask(row: TaskRow): MagangTask {
  const submission = row.submissions[0] ?? null;

  const status: TaskBaseStatus =
    submission?.status === "SUBMITTED"
      ? "TERKUMPUL"
      : submission?.feedbackText
        ? "DIKEMBALIKAN"
        : "BELUM";

  // Mentor attachment (optional). May be a Bunny object path or an external URL.
  let attachment: TaskAttachment | undefined;
  if (row.attachmentUrl) {
    const stored = row.attachmentUrl;
    const url = resolveTaskFileUrl(stored);
    const fallbackName = isExternalUrl(stored) ? "Lampiran (tautan)" : lastSegmentOfPath(stored);
    const name = row.attachmentName ?? fallbackName;
    const sizeLabel = row.attachmentSize ? formatFileSize(row.attachmentSize) : "—";
    attachment = { name, sizeLabel, kind: inferAttachmentKind(name), url };
  }

  // Student's own submission (when present + has a file uploaded).
  let submittedFile: SubmittedFile | undefined;
  if (submission?.submissionUrl) {
    const stored = submission.submissionUrl;
    const url = resolveTaskFileUrl(stored);
    const name = submission.submissionFileName ?? lastSegmentOfPath(stored);
    const sizeLabel = submission.submissionFileSize
      ? formatFileSize(submission.submissionFileSize)
      : "—";
    submittedFile = {
      name,
      sizeLabel,
      submittedAtISO: submission.submittedAt.toISOString(),
      url,
    };
  }

  // Mentor return-feedback (only meaningful while the row is NOT_SUBMITTED).
  let feedback: MentorFeedback | undefined;
  if (submission?.status === "NOT_SUBMITTED" && submission.feedbackText) {
    feedback = {
      mentorName: row.mentor.name,
      returnedAtISO: (submission.reviewedAt ?? submission.updatedAt).toISOString(),
      text: submission.feedbackText,
    };
  }

  return {
    id: row.id,
    title: row.title,
    mentorName: row.mentor.name,
    deadlineISO: row.deadline.toISOString(),
    description: row.description,
    attachment,
    status,
    feedback,
    submittedFile,
  };
}

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  deadline: true,
  attachmentUrl: true,
  attachmentName: true,
  attachmentSize: true,
  mentor: { select: { name: true } },
  submissions: {
    select: {
      status: true,
      submissionUrl: true,
      submissionFileName: true,
      submissionFileSize: true,
      feedbackText: true,
      reviewedAt: true,
      submittedAt: true,
      updatedAt: true,
    },
  },
} as const;

export async function loadTaskList(userId: string): Promise<MagangTask[] | null> {
  const profile = await prisma.internshipProfile.findUnique({
    where: { userId },
    select: { classId: true },
  });
  if (!profile) return null;

  const rows = await prisma.task.findMany({
    where: { classId: profile.classId },
    select: {
      ...TASK_SELECT,
      submissions: {
        ...TASK_SELECT.submissions,
        where: { studentId: userId },
      },
    },
    orderBy: { deadline: "asc" },
  });

  return rows.map((r) => mapToMagangTask(r as TaskRow));
}

export async function loadTaskDetail(
  userId: string,
  taskId: string,
): Promise<MagangTask | null> {
  const profile = await prisma.internshipProfile.findUnique({
    where: { userId },
    select: { classId: true },
  });
  if (!profile) return null;

  const row = await prisma.task.findFirst({
    where: { id: taskId, classId: profile.classId },
    select: {
      ...TASK_SELECT,
      submissions: {
        ...TASK_SELECT.submissions,
        where: { studentId: userId },
      },
    },
  });

  if (!row) return null;
  const task = mapToMagangTask(row as TaskRow);
  // Detail renders the description as rich text — sign inline image paths now
  // (the list view never shows the body, so signing is detail-only).
  return { ...task, description: signTaskDescriptionImages(task.description) };
}
