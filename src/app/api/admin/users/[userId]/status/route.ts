import { NextResponse } from "next/server";
import { z } from "zod";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ isActive: z.boolean() });

/**
 * PATCH /api/admin/users/[userId]/status — enable/disable an account (PRD
 * §6.11.4 "Nonaktifkan"). Disabling flips `isActive=false` (login blocked by the
 * session hook in auth.ts) and revokes live sessions. Admins cannot disable
 * themselves.
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ userId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { userId } = await ctx.params;
  if (userId === auth.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa menonaktifkan akun Anda sendiri." },
      { status: 403 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isActive: parsed.data.isActive },
      }),
      // Disabling kills any live session immediately.
      ...(parsed.data.isActive
        ? []
        : [prisma.session.deleteMany({ where: { userId } })]),
    ]);
  } catch (err) {
    console.error("[admin/users status PATCH] failed", err);
    return NextResponse.json(
      { error: "Gagal mengubah status akun. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { isActive: parsed.data.isActive } });
}
