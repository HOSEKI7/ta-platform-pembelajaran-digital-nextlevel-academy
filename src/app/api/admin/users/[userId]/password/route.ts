import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { setUserPassword } from "@/lib/admin-user-write";
import { setTempPasswordSchema } from "@/lib/validations/admin-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[userId]/password — admin sets a TEMPORARY password for
 * a Peserta Didik (PRD §6.11.4). The account is flagged `mustChangePassword`, so
 * the user is forced to set their own password at next login before accessing
 * any page. Restricted to Peserta Didik — admin must never hold a student's
 * active password (Mentor/Magang passwords are set directly via the edit route).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> },
) {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;

  const { userId } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }
  const parsed = setTempPasswordSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  if (user.role !== Role.PESERTA_DIDIK) {
    return NextResponse.json(
      {
        error:
          "Password sementara hanya untuk Peserta Didik. Untuk Mentor/Magang, atur password langsung lewat Edit.",
      },
      { status: 400 },
    );
  }

  try {
    await setUserPassword(userId, parsed.data.tempPassword, {
      mustChangePassword: true,
    });
  } catch (err) {
    console.error("[admin/users password POST] failed", err);
    return NextResponse.json(
      { error: "Gagal menyetel password sementara. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
