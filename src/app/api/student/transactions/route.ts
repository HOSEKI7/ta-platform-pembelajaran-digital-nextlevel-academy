import { NextResponse, type NextRequest } from "next/server";

import { Role } from "@/generated/prisma";
import { requireRoleInRoute } from "@/lib/auth-server";
import { loadTransactionRows } from "@/lib/transaction-data-loader";
import { transactionsQuerySchema } from "@/lib/validators/transactions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await requireRoleInRoute(Role.PESERTA_DIDIK);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const parsed = transactionsQuerySchema.safeParse({
    sort: searchParams.get("sort") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Parameter tidak valid." },
      { status: 400 },
    );
  }

  try {
    const data = await loadTransactionRows(session.user.id, parsed.data);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/student/transactions]", err);
    return NextResponse.json(
      { error: "Gagal memuat transaksi." },
      { status: 500 },
    );
  }
}
