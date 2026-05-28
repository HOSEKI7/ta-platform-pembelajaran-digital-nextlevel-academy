import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

import { Role } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const session = await requireRoleInRoute([
    Role.PESERTA_DIDIK,
    Role.PESERTA_MAGANG,
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
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.username !== undefined) body.username = data.username;
    if (data.image !== undefined) body.image = data.image;

    await auth.api.updateUser({
      headers: await headers(),
      body,
    });
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
    },
  });
}
