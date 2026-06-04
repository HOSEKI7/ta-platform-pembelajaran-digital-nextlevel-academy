import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { isUniqueError, setUserPassword } from "@/lib/admin-user-write";
import { editUserSchema } from "@/lib/validations/admin-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function needsClass(role: Role): boolean {
  return role === Role.PESERTA_MAGANG || role === Role.MENTOR;
}

/**
 * PATCH /api/admin/users/[userId] — edit an existing account (PRD §6.11.4).
 * Role is locked (read from the DB, never changed here). Updates name, email,
 * username, Class assignment (magang/mentor) and institution (magang). An
 * optional `newPassword` is honored only for magang/mentor (Peserta Didik uses
 * the separate temp-password action). Email/username collisions → 409.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ userId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { userId } = await ctx.params;
  const existing = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      role: true,
      internshipProfile: { select: { classId: true } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }

  const parsed = editUserSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const role = existing.role; // locked — ignore any role in the body

  const email = input.email.trim().toLowerCase();
  const username = input.username?.trim() || null;
  const classChangesAllowed = needsClass(role);
  const newClassId = input.classId?.trim() || null;

  if (classChangesAllowed && !newClassId) {
    return NextResponse.json({ error: "Kelas wajib dipilih." }, { status: 400 });
  }

  // Magang quota guard when moving into a (different) class.
  if (
    role === Role.PESERTA_MAGANG &&
    newClassId &&
    newClassId !== existing.internshipProfile?.classId
  ) {
    const cls = await prisma.class.findUnique({
      where: { id: newClassId },
      select: { id: true, maxStudents: true },
    });
    if (!cls) return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 400 });
    const count = await prisma.internshipProfile.count({
      where: { classId: cls.id, NOT: { userId } },
    });
    if (count >= cls.maxStudents) {
      return NextResponse.json(
        { error: `Kelas sudah penuh (maks ${cls.maxStudents} peserta magang).` },
        { status: 409 },
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { name: input.name.trim(), email, username },
      });

      if (role === Role.PESERTA_MAGANG) {
        await tx.internshipProfile.upsert({
          where: { userId },
          create: {
            userId,
            classId: newClassId!,
            institution: input.institution?.trim() || null,
          },
          update: {
            classId: newClassId!,
            institution: input.institution?.trim() || null,
          },
        });
      } else if (role === Role.MENTOR) {
        const gender = input.gender ?? null;
        await tx.mentorProfile.upsert({
          where: { userId },
          create: { userId, classId: newClassId!, gender },
          update: { classId: newClassId!, gender },
        });
      }
    });
  } catch (err) {
    if (isUniqueError(err)) {
      return NextResponse.json(
        { error: "Email atau username sudah dipakai pengguna lain." },
        { status: 409 },
      );
    }
    console.error("[admin/users PATCH] failed", err);
    return NextResponse.json(
      { error: "Gagal memperbarui pengguna. Coba lagi." },
      { status: 500 },
    );
  }

  // Direct password set — magang/mentor only (admin manages their credentials).
  if (input.newPassword && needsClass(role)) {
    try {
      await setUserPassword(userId, input.newPassword);
    } catch (err) {
      console.error("[admin/users PATCH] password set failed", err);
      return NextResponse.json(
        { error: "Profil tersimpan, tetapi gagal memperbarui password." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ data: { id: userId } });
}

/**
 * DELETE /api/admin/users/[userId] — soft delete for audit (PRD §6.11.4): set
 * `deletedAt`, flip `isActive=false` (blocks login via the session hook) and
 * revoke sessions. The row is retained. Admins cannot delete themselves or any
 * ADMINISTRATOR account.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ userId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { userId } = await ctx.params;
  if (userId === auth.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun Anda sendiri." },
      { status: 403 },
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  if (user.role === Role.ADMINISTRATOR) {
    return NextResponse.json(
      { error: "Akun administrator tidak bisa dihapus." },
      { status: 403 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), isActive: false },
      }),
      prisma.session.deleteMany({ where: { userId } }),
    ]);
  } catch (err) {
    console.error("[admin/users DELETE] failed", err);
    return NextResponse.json(
      { error: "Gagal menghapus pengguna. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
