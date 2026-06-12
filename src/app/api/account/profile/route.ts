import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

import { Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadAvatarPaths } from "@/lib/avatars";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const session = await requireRoleInRoute([
    Role.PESERTA_DIDIK,
    Role.PESERTA_MAGANG,
    Role.MENTOR,
    Role.ADMINISTRATOR,
  ]);
  if (session instanceof Response) return session;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa JSON." },
      { status: 400 },
    );
  }

  const parsed = updateProfileSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Authoritative avatar allowlist check against the live preset list — the
  // Zod schema only validated the path shape.
  if (typeof data.image === "string" && !loadAvatarPaths().has(data.image)) {
    return NextResponse.json(
      { error: "Avatar tidak valid." },
      { status: 400 },
    );
  }

  // Institution belongs to InternshipProfile (not the `user` table) and is only
  // self-editable by Peserta Magang while it's still empty — once filled by the
  // admin or by this one-time edit it's locked. Enforce server-side; the UI lock
  // is just convenience.
  let institutionResult: string | null | undefined;
  if (data.institution !== undefined) {
    if (session.user.role !== Role.PESERTA_MAGANG) {
      return NextResponse.json(
        { error: "Institusi hanya dapat diisi oleh peserta magang." },
        { status: 400 },
      );
    }

    const profile = await prisma.internshipProfile.findUnique({
      where: { userId: session.user.id },
      select: { institution: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Profil magang tidak ditemukan." },
        { status: 404 },
      );
    }
    if (profile.institution && profile.institution.trim().length > 0) {
      return NextResponse.json(
        { error: "Institusi sudah dikunci dan tidak dapat diubah." },
        { status: 409 },
      );
    }

    const value = data.institution.trim();
    await prisma.internshipProfile.update({
      where: { userId: session.user.id },
      data: { institution: value },
    });
    institutionResult = value;
  }

  // Username uniqueness — Better Auth 1.6 enforces this too, but checking
  // here gives a friendly Indonesian error before the auth API throws.
  if (data.username && data.username !== (session.user.username ?? "")) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Username sudah dipakai. Pilih yang lain." },
        { status: 409 },
      );
    }
  }

  try {
    // Build the patch body — only include fields the user actually changed.
    // Institution lives in InternshipProfile (handled above), so it never goes
    // through Better Auth's updateUser.
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.username !== undefined) body.username = data.username;
    if (data.image !== undefined) body.image = data.image;

    if (Object.keys(body).length > 0) {
      await auth.api.updateUser({
        headers: await headers(),
        body,
      });
    }
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json(
        { error: err.body?.message ?? "Gagal memperbarui profil." },
        { status: err.statusCode ?? 400 },
      );
    }
    console.error("[PATCH /api/account/profile]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      name: data.name ?? session.user.name,
      username: data.username ?? session.user.username ?? null,
      image:
        data.image !== undefined ? data.image : (session.user.image ?? null),
      institution: institutionResult,
    },
  });
}
