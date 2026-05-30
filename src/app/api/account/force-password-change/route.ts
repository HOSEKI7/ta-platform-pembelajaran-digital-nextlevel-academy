import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { setUserPassword } from "@/lib/admin-user-write";
import { forcePasswordChangeSchema } from "@/lib/validations/admin-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/account/force-password-change — a logged-in user who was given a
 * temporary password by an admin (`mustChangePassword=true`) sets their own
 * password. Clears the flag and revokes all sessions, so the user re-logs in
 * with the new credential (and a fresh session that reads the cleared flag —
 * avoiding the cookie-cache staleness on the guard).
 */
export async function POST(req: Request) {
  // No role gate: any authenticated user can be forced to rotate a temp password.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Re-read the flag from the DB (the cookie-cached session may be stale).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });
  if (!user?.mustChangePassword) {
    return NextResponse.json(
      { error: "Tidak ada permintaan ganti password." },
      { status: 400 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON." }, { status: 400 });
  }
  const parsed = forcePasswordChangeSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    await setUserPassword(session.user.id, parsed.data.newPassword, {
      mustChangePassword: false,
    });
  } catch (err) {
    console.error("[account/force-password-change] failed", err);
    return NextResponse.json(
      { error: "Gagal mengganti password. Coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
