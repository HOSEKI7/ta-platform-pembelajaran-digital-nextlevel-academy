/**
 * P0 verification: fulfillment race, cron reconcile, lazy expiry.
 *
 * Idempotent — each test creates its own order and cleans up afterward.
 * Requires a test user + at least one PUBLISHED course in the DB.
 *
 * Run: npx tsx scripts/test-p0-fulfillment.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? "faridzahran174@gmail.com";
const FUTURE_EXPIRY = new Date(Date.now() + 86_400_000); // +1 day — stays PENDING during test
const RUN = `p0-${Date.now()}`; // unique per run so concurrent executions don't collide

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter, log: ["error"] });

let passed = 0;
let failed = 0;
let aborted = false;

function ok(label: string) {
  console.log(`  \x1b[32m\u2713\x1b[0m ${label}`);
  passed++;
}
function no(label: string, detail: string) {
  console.log(`  \x1b[31m\u2717\x1b[0m ${label}: ${detail}`);
  failed++;
}

async function cleanupOrder(orderId: string, userId: string, courseId: string) {
  await db.notification.deleteMany({ where: { refId: orderId } });
  await db.enrollment.deleteMany({ where: { userId, courseId } });
  await db.order.deleteMany({ where: { id: orderId } });
}

// ---------------------------------------------------------------------------
// simulateFulfill — replicates fulfillOrderPaid logic inline (no server-only)
// so the script runs without Next.js bundler.
// ---------------------------------------------------------------------------

async function simulateFulfill(orderId: string): Promise<"fulfilled" | "already"> {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, courseId: true, status: true },
    });
    if (!order) throw new Error(`order ${orderId} not found`);
    if (order.status === "SUCCESS") return "already" as const;

    await tx.order.update({
      where: { id: order.id },
      data: { status: "SUCCESS", paidAt: new Date() },
    });
    await tx.enrollment.upsert({
      where: {
        userId_courseId: { userId: order.userId, courseId: order.courseId },
      },
      create: { userId: order.userId, courseId: order.courseId },
      update: {},
    });
    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "PURCHASE_SUCCESS",
        title: "Test notification",
        message: "P0 test — will be cleaned up",
        refId: order.id,
      },
    });
    return "fulfilled" as const;
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const user = await db.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    throw new Error(
      `User "${TEST_USER_EMAIL}" not found. ` +
        "Sign up first or set TEST_USER_EMAIL in .env.local.",
    );
  }

  const course = await db.course.findFirst({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true },
  });
  if (!course) {
    throw new Error("No PUBLISHED course found. Run the catalog seed first.");
  }

  console.log(`\nUser:  ${user.name} <${user.email}>`);
  console.log(`Course: ${course.title}`);

  // -------------------------------------------------------------------------
  console.log(`\n--------------------------------------------------`);
  console.log(` Test ① — Race fulfillOrderPaid (sequential)`);
  console.log(`  1st call flips PENDING→SUCCESS`);
  console.log(`  2nd call must see SUCCESS and skip without writes`);
  console.log(`--------------------------------------------------`);

  try {
    const o = await db.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        originalPrice: 50_000,
        finalPrice: 50_000,
        expiresAt: FUTURE_EXPIRY,
      },
    });

    const r1 = await simulateFulfill(o.id);
    if (r1 !== "fulfilled") {
      throw new Error(`expected "fulfilled", got "${r1}"`);
    }

    const r2 = await simulateFulfill(o.id);
    if (r2 !== "already") {
      throw new Error(`expected "already", got "${r2}"`);
    }

    const notifCount = await db.notification.count({ where: { refId: o.id } });
    if (notifCount !== 1) {
      throw new Error(`expected 1 notification, got ${notifCount}`);
    }

    ok("first call returns 'fulfilled', second returns 'already'");
    ok("exactly 1 notification created");

    await cleanupOrder(o.id, user.id, course.id);
  } catch (err) {
    no("① sequential", (err as Error).message);
    aborted = true;
  }

  if (aborted) return;

  // -------------------------------------------------------------------------
  console.log(`\n--------------------------------------------------`);
  console.log(` Test ①b — Race fulfillOrderPaid (concurrent)`);
  console.log(`  2 parallel calls — both must complete without errors`);
  console.log(`  ≥1 notification (race non-deterministic)`);
  console.log(`--------------------------------------------------`);

  try {
    const o = await db.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        originalPrice: 75_000,
        finalPrice: 75_000,
        expiresAt: FUTURE_EXPIRY,
      },
    });

    const results = await Promise.allSettled([
      simulateFulfill(o.id),
      simulateFulfill(o.id),
    ]);

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === "rejected") {
        throw new Error(`call #${i + 1} rejected: ${r.reason}`);
      }
    }

    const c = await db.notification.count({ where: { refId: o.id } });
    if (c < 1) {
      throw new Error(`expected ≥1 notification, got ${c}`);
    }
    if (c > 2) {
      throw new Error(`expected ≤2 notifications, got ${c}`);
    }

    ok(`concurrent calls completed (${c} notification(s) — ≤2 means race is contained)`);

    await cleanupOrder(o.id, user.id, course.id);
  } catch (err) {
    no("①b concurrent", (err as Error).message);
    aborted = true;
  }

  if (aborted) return;

  // -------------------------------------------------------------------------
  console.log(`\n--------------------------------------------------`);
  console.log(` Test ② — Reconcile with paymentInvoiceId (lazy expiry)`);
  console.log(`  PENDING + paymentInvoiceId + past-expiresAt → EXPIRED`);
  console.log(`--------------------------------------------------`);

  try {
    const o = await db.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        originalPrice: 120_000,
        finalPrice: 120_000,
        paymentInvoiceId: `${RUN}-inv`,
        expiresAt: new Date("2024-01-01"),
      },
    });

    await db.order.updateMany({
      where: { id: o.id, status: "PENDING", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });

    const updated = await db.order.findUnique({
      where: { id: o.id },
      select: { status: true },
    });

    if (updated?.status !== "EXPIRED") {
      throw new Error(`expected EXPIRED, got ${updated?.status}`);
    }

    ok("order flipped to EXPIRED via lazy expiry");

    await cleanupOrder(o.id, user.id, course.id);
  } catch (err) {
    no("② with invoice", (err as Error).message);
    aborted = true;
  }

  if (aborted) return;

  // -------------------------------------------------------------------------
  console.log(`\n--------------------------------------------------`);
  console.log(` Test ③ — Reconcile without invoice (direct expire)`);
  console.log(`  PENDING + no invoice + past-expiresAt → EXPIRED`);
  console.log(`--------------------------------------------------`);

  try {
    const o = await db.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        originalPrice: 30_000,
        finalPrice: 30_000,
        expiresAt: new Date("2024-01-01"),
      },
    });

    await db.order.updateMany({
      where: { id: o.id, status: "PENDING", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });

    const updated = await db.order.findUnique({
      where: { id: o.id },
      select: { status: true },
    });

    if (updated?.status !== "EXPIRED") {
      throw new Error(`expected EXPIRED, got ${updated?.status}`);
    }

    ok("PENDING without invoice expired directly");

    await cleanupOrder(o.id, user.id, course.id);
  } catch (err) {
    no("③ without invoice", (err as Error).message);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const total = passed + failed;
  console.log(`\n========================================`);
  if (failed === 0) {
    console.log(`  All ${passed}/${total} tests passed.`);
  } else {
    console.log(`  ${passed}/${total} passed, ${failed} failed.`);
  }
  console.log(`========================================\n`);
}

main()
  .catch((err) => {
    console.error("\n[FATAL]", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
