import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { reconcileOrder } from "@/lib/payment/reconcile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Cron: reconcile past-due PENDING orders.
 *
 * Orders with a `paymentInvoiceId` (user opened Snap) are reconciled against
 * Midtrans so a paid-but-no-webhook order gets fulfilled instead of silently
 * expiring. Orders without an invoice are just expired (user never paid).
 * BATCH_SIZE=5 limits concurrent Midtrans API calls (flash-sale volume).
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

  const expired = await prisma.order.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    select: { id: true, status: true, paymentInvoiceId: true, finalPrice: true, expiresAt: true },
  });

  const withoutInvoice = expired.filter((o) => !o.paymentInvoiceId);
  const withInvoice = expired.filter((o) => o.paymentInvoiceId);

  // ponytail: BATCH_SIZE=5, increase if Midtrans SLA confirms higher throughput.
  const BATCH_SIZE = 5;
  let reconciled = 0;
  let failed = 0;
  for (let i = 0; i < withInvoice.length; i += BATCH_SIZE) {
    const batch = withInvoice.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((o) => reconcileOrder(o)),
    );
    for (const r of results) {
      if (r.status === "fulfilled") reconciled += 1;
      else failed += 1;
    }
  }

  let expiredCount = 0;
  if (withoutInvoice.length > 0) {
    const r = await prisma.order.updateMany({
      where: { id: { in: withoutInvoice.map((o) => o.id) }, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
    expiredCount = r.count;
  }

  return NextResponse.json({ data: { reconciled, expired: expiredCount, failed } });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
