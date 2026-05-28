import { NextResponse } from "next/server";

import { NotificationType, Role, SubmissionStatus } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import {
  removeBunnyFile,
  uploadTaskFile,
} from "@/lib/bunny-storage";
import { prisma } from "@/lib/prisma";
import {
  SUBMISSION_ALLOWED_EXTS,
  SUBMISSION_MAX_BYTES,
  getFileExt,
} from "@/components/internship/tasks/task-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/internship/tasks/[taskId]/submit
 *
 * Multipart upload of the peserta-magang's task submission. Server-authoritative:
 * deadline + class membership + file constraints are validated here regardless
 * of client state (PRD §6.9.3).
 *
 * Flow:
 *   1. Auth: PESERTA_MAGANG only.
 *   2. Verify task exists AND peserta is in the task's class.
 *   3. Verify deadline hasn't passed.
 *   4. Parse multipart; validate file (ext + size).
 *   5. Read existing submission (capture previous storage path for cleanup).
 *   6. Upload to Bunny Storage.
 *   7. Upsert TaskSubmission + create TASK_SUBMITTED Notification for mentor
 *      (single Prisma transaction).
 *   8. On DB failure → rollback the Bunny object. On success → best-effort
 *      remove the previous file (revision case).
 *
 * Responses: `{ data }` / `{ error }` with appropriate HTTP codes (PRD style).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ taskId: string }> },
) {
  const auth = await requireRoleInRoute(Role.PESERTA_MAGANG);
  if (auth instanceof Response) return auth;

  const { taskId } = await ctx.params;

  // 2. Task + class membership in a single round-trip.
  const [task, profile] = await Promise.all([
    prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        classId: true,
        mentorId: true,
        deadline: true,
      },
    }),
    prisma.internshipProfile.findUnique({
      where: { userId: auth.user.id },
      select: { classId: true },
    }),
  ]);

  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }
  if (!profile || profile.classId !== task.classId) {
    return NextResponse.json(
      { error: "Tugas ini bukan untuk kelas Anda." },
      { status: 404 },
    );
  }

  // 3. Deadline gate (server clock — client is never trusted).
  if (task.deadline.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Pengumpulan ditutup — tenggat sudah lewat." },
      { status: 403 },
    );
  }

  // 4. Parse + validate the file.
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa multipart/form-data." },
      { status: 400 },
    );
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File wajib disertakan." }, { status: 400 });
  }
  const ext = getFileExt(file.name);
  if (!(SUBMISSION_ALLOWED_EXTS as readonly string[]).includes(ext)) {
    return NextResponse.json(
      { error: "Format tidak didukung. Gunakan PDF, DOCX, atau ZIP." },
      { status: 400 },
    );
  }
  if (file.size > SUBMISSION_MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran file melebihi batas 5 MB." },
      { status: 413 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }

  // 5. Existing submission (for old-file cleanup).
  const existing = await prisma.taskSubmission.findUnique({
    where: { taskId_studentId: { taskId: task.id, studentId: auth.user.id } },
    select: { id: true, submissionUrl: true },
  });
  const previousObjectPath = existing?.submissionUrl ?? null;

  // 6. Upload first. If upload fails we never touch the DB.
  let uploaded;
  try {
    uploaded = await uploadTaskFile({
      taskId: task.id,
      studentId: auth.user.id,
      file,
    });
  } catch (err) {
    console.error("[internship/tasks/submit] upload failed", err);
    const msg =
      err instanceof Error && err.message.includes("belum dikonfigurasi")
        ? "Penyimpanan file belum dikonfigurasi di server."
        : "Gagal mengunggah file ke penyimpanan.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // 7. DB write — single transaction so submission + notification atomically.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.taskSubmission.upsert({
        where: { taskId_studentId: { taskId: task.id, studentId: auth.user.id } },
        create: {
          taskId: task.id,
          studentId: auth.user.id,
          submissionUrl: uploaded.objectPath,
          submissionFileName: uploaded.fileName,
          submissionFileSize: uploaded.fileSize,
          status: SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
        },
        update: {
          submissionUrl: uploaded.objectPath,
          submissionFileName: uploaded.fileName,
          submissionFileSize: uploaded.fileSize,
          status: SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
          // Clear the previous review state — mentor will re-check this submission.
          reviewedAt: null,
        },
      });

      // Best-effort mentor notification — PRD §6.10.1: "<Nama> baru saja mengumpulkan tugas."
      await tx.notification.create({
        data: {
          userId: task.mentorId,
          type: NotificationType.TASK_SUBMITTED,
          title: "Tugas dikumpulkan",
          message: `${auth.user.name} mengumpulkan tugas "${task.title}".`,
          refId: task.id,
        },
      });
    });
  } catch (err) {
    console.error("[internship/tasks/submit] db write failed", err);
    // Rollback the storage upload so we don't leak orphans.
    await removeBunnyFile(uploaded.objectPath);
    return NextResponse.json(
      { error: "Gagal menyimpan pengumpulan. Coba lagi." },
      { status: 500 },
    );
  }

  // 8. Best-effort delete the previous submission file (revision case).
  if (previousObjectPath && previousObjectPath !== uploaded.objectPath) {
    removeBunnyFile(previousObjectPath).catch(() => {
      /* logged inside removeBunnyFile */
    });
  }

  return NextResponse.json({
    data: {
      submittedAtISO: new Date().toISOString(),
      fileName: uploaded.fileName,
      fileSize: uploaded.fileSize,
    },
  });
}
