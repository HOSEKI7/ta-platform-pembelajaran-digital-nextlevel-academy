import { NextResponse } from "next/server";
import { fromZonedTime } from "date-fns-tz";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  isExternalUrl,
  removeBunnyFile,
  uploadTaskAttachment,
} from "@/lib/bunny-storage";
import {
  extractTaskImagePaths,
  prepareTaskDescription,
} from "@/lib/task-description";
import { createTaskSchema } from "@/lib/validators/mentor-tasks";
import {
  SUBMISSION_ALLOWED_EXTS,
  SUBMISSION_MAX_BYTES,
  getFileExt,
} from "@/components/internship/tasks/task-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIB_TZ = "Asia/Jakarta";

/**
 * PUT /api/admin/internship/tasks/[taskId] — edit a task (title, rich-text
 * description, deadline, attachment). ADMINISTRATOR, NOT class-scoped (the admin
 * oversees every class). Like the mentor edit, the deadline is not forced into
 * the future so an unchanged past deadline stays valid.
 */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ taskId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { taskId } = await ctx.params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, attachmentUrl: true, description: true },
  });
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa multipart/form-data." },
      { status: 400 },
    );
  }

  const parsed = createTaskSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    deadline: form.get("deadline"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const { title, description, deadline } = parsed.data;

  const deadlineUtc = fromZonedTime(deadline, WIB_TZ);
  if (Number.isNaN(deadlineUtc.getTime())) {
    return NextResponse.json({ error: "Tenggat tidak valid." }, { status: 400 });
  }

  // Description image (deferred upload): validate the 1-image cap and upload a
  // newly attached image now (rolled back on DB failure). `finalPath` is the
  // image now stored; any old image that differs is cleaned up after save.
  const prepared = await prepareTaskDescription({
    html: description,
    pendingImage: form.get("descriptionImage"),
    uploaderId: auth.user.id,
  });
  if (!prepared.ok) {
    return NextResponse.json({ error: prepared.error }, { status: prepared.status });
  }
  const normalizedDescription = prepared.html;

  // Attachment intent. "replace" without a file degrades to "keep".
  const rawFile = form.get("file");
  const hasNewFile = rawFile instanceof File && rawFile.size > 0;
  let action = form.get("attachmentAction");
  if (action === "replace" && !hasNewFile) action = "keep";

  const updateData: {
    title: string;
    description: string;
    deadline: Date;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentSize?: number | null;
  } = { title, description: normalizedDescription, deadline: deadlineUtc };

  let uploadedPath: string | null = null;
  let oldToRemove: string | null = null;

  if (action === "remove") {
    updateData.attachmentUrl = null;
    updateData.attachmentName = null;
    updateData.attachmentSize = null;
    oldToRemove = task.attachmentUrl;
  } else if (action === "replace" && hasNewFile) {
    const file = rawFile;
    const ext = getFileExt(file.name);
    if (!(SUBMISSION_ALLOWED_EXTS as readonly string[]).includes(ext)) {
      return NextResponse.json(
        { error: "Format lampiran tidak didukung. Gunakan PDF, DOCX, atau ZIP." },
        { status: 400 },
      );
    }
    if (file.size > SUBMISSION_MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran lampiran melebihi batas 5 MB." },
        { status: 413 },
      );
    }
    try {
      const uploaded = await uploadTaskAttachment({ mentorId: auth.user.id, file });
      uploadedPath = uploaded.objectPath;
      updateData.attachmentUrl = uploaded.objectPath;
      updateData.attachmentName = uploaded.fileName;
      updateData.attachmentSize = uploaded.fileSize;
      oldToRemove = task.attachmentUrl;
    } catch (err) {
      console.error("[admin/internship/tasks PUT] attachment upload failed", err);
      return NextResponse.json(
        { error: "Gagal mengunggah lampiran ke penyimpanan." },
        { status: 502 },
      );
    }
  }

  try {
    await prisma.$transaction([
      prisma.task.update({ where: { id: task.id }, data: updateData }),
      prisma.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: "TASK_EDIT",
          entityType: "Task",
          entityId: task.id,
          metadata: { via: "admin" },
        },
      }),
    ]);
  } catch (err) {
    console.error("[admin/internship/tasks PUT] db update failed", err);
    if (uploadedPath) await removeBunnyFile(uploadedPath);
    if (prepared.uploadedPath) await removeBunnyFile(prepared.uploadedPath);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan. Coba lagi." },
      { status: 500 },
    );
  }

  // Best-effort cleanup of the replaced/removed attachment (Bunny paths only).
  if (oldToRemove && !isExternalUrl(oldToRemove) && oldToRemove !== uploadedPath) {
    removeBunnyFile(oldToRemove).catch(() => {});
  }

  // Best-effort cleanup of a replaced/removed description image.
  for (const oldPath of extractTaskImagePaths(task.description)) {
    if (oldPath !== prepared.finalPath) removeBunnyFile(oldPath).catch(() => {});
  }

  return NextResponse.json({ data: { id: task.id } });
}

/**
 * DELETE /api/admin/internship/tasks/[taskId] — permanently delete a task and
 * (cascade) its submissions, then best-effort remove all related Bunny blobs.
 * ADMINISTRATOR, not class-scoped.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ taskId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { taskId } = await ctx.params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      attachmentUrl: true,
      description: true,
      submissions: { select: { submissionUrl: true } },
    },
  });
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  }

  // Collect Bunny object paths to clean up after the row is gone.
  const paths = new Set<string>();
  if (task.attachmentUrl && !isExternalUrl(task.attachmentUrl)) {
    paths.add(task.attachmentUrl);
  }
  for (const path of extractTaskImagePaths(task.description)) paths.add(path);
  for (const s of task.submissions) {
    if (s.submissionUrl && !isExternalUrl(s.submissionUrl)) paths.add(s.submissionUrl);
  }

  try {
    await prisma.$transaction([
      prisma.task.delete({ where: { id: task.id } }),
      prisma.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: "TASK_DELETE",
          entityType: "Task",
          entityId: task.id,
          metadata: { via: "admin" },
        },
      }),
    ]);
  } catch (err) {
    console.error("[admin/internship/tasks DELETE] db delete failed", err);
    return NextResponse.json(
      { error: "Gagal menghapus tugas. Coba lagi." },
      { status: 500 },
    );
  }

  await Promise.all([...paths].map((path) => removeBunnyFile(path)));

  return NextResponse.json({ data: { ok: true } });
}
