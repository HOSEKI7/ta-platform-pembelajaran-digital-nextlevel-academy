import { NextResponse } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { canManageAdmins } from "@/lib/admin-permissions";
import { loadAdminAccounts } from "@/lib/admin-accounts-loader";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRoleInRoute(Role.ADMINISTRATOR);
  if (auth instanceof Response) return auth;
  if (!canManageAdmins(auth.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await loadAdminAccounts();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/admins GET] failed", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar administrator." },
      { status: 500 },
    );
  }
}
