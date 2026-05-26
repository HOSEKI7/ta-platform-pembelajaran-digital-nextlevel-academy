import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Cron: flip abandoned PENDING orders past their 60-minute window to EXPIRED
 * (PRD §6.4 — "Timer habis → EXPIRED, job scheduler").
 *
 * Protected by the `CRON_SECRET` bearer token. Configure a scheduler (e.g.
 * Vercel Cron) to hit this every few minutes:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Note: this only changes status. SUCCESS orders are never touched (the webhook
 * is the source of truth), so a late webhook can still win a race against the
 * window — but only PENDING rows are eligible here.
 */
async function handle(request: NextRequest) {
  const secret = env.cronSecret();
  if (!secret) {
    return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.order.updateMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ data: { expired: result.count } });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
