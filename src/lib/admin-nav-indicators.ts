import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Admin sidebar "new activity" dots (global, server-side).
 *
 * A dot shows next to a menu item when there is data created after the last time
 * *any* admin opened that page — the "last seen" marker is a single shared
 * PlatformSetting, so opening the page clears the dot for every admin. No schema
 * change: just two timestamp rows.
 */

export type AdminNavScope = "users" | "transactions";

const SETTING_KEY: Record<AdminNavScope, string> = {
  users: "ADMIN_LAST_SEEN_USERS",
  transactions: "ADMIN_LAST_SEEN_TRANSACTIONS",
};

export type AdminNavIndicators = {
  /** A non-deleted user registered since the menu was last opened. */
  users: boolean;
  /** A non-deleted order was created since the menu was last opened. */
  transactions: boolean;
};

async function lastSeen(scope: AdminNavScope): Promise<Date> {
  const row = await prisma.platformSetting.findUnique({
    where: { key: SETTING_KEY[scope] },
    select: { value: true },
  });
  // Never seen → epoch, so any existing row counts as "new".
  if (!row?.value) return new Date(0);
  const parsed = new Date(row.value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/** Whether each admin menu has unseen activity. */
export async function loadAdminNavIndicators(): Promise<AdminNavIndicators> {
  const [usersSince, txnSince] = await Promise.all([
    lastSeen("users"),
    lastSeen("transactions"),
  ]);

  const [newUser, newOrder] = await Promise.all([
    prisma.user.findFirst({
      where: { deletedAt: null, createdAt: { gt: usersSince } },
      select: { id: true },
    }),
    prisma.order.findFirst({
      where: { deletedAt: null, createdAt: { gt: txnSince } },
      select: { id: true },
    }),
  ]);

  return { users: newUser !== null, transactions: newOrder !== null };
}

/** Stamp a menu as seen now (clears its dot for all admins). */
export async function markAdminNavSeen(
  scope: AdminNavScope,
  actorId: string,
): Promise<void> {
  const value = new Date().toISOString();
  await prisma.platformSetting.upsert({
    where: { key: SETTING_KEY[scope] },
    create: { key: SETTING_KEY[scope], value, updatedBy: actorId },
    update: { value, updatedBy: actorId },
  });
}
