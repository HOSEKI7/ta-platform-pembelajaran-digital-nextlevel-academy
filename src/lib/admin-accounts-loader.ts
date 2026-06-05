import "server-only";

import { createHash } from "node:crypto";

import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { ADMIN_COUNT_WARNING_THRESHOLD } from "@/lib/admin-permissions";

/**
 * Read model for the Administrator-account management page (PRD §6.11.12). The
 * lists are intentionally small (admins are few), so there is no pagination —
 * both lists are returned whole, mirroring `loadInternshipConfig`.
 */

export type AdminAccountRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
};

export type PendingInviteRow = {
  id: string;
  email: string;
  name: string | null;
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
};

export type AdminAccountsData = {
  admins: AdminAccountRow[];
  pendingInvites: PendingInviteRow[];
  activeAdminCount: number;
  tooManyAdmins: boolean;
  warningThreshold: number;
};

export async function loadAdminAccounts(): Promise<AdminAccountsData> {
  const now = new Date();

  const [admins, invites] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.ADMINISTRATOR, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.adminInvite.findMany({
      where: { acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
      select: {
        id: true,
        email: true,
        name: true,
        expiresAt: true,
        createdAt: true,
        invitedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeAdminCount = admins.filter((a) => a.isActive).length;

  return {
    admins: admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      image: a.image,
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
    })),
    pendingInvites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      name: i.name,
      invitedByName: i.invitedBy?.name ?? "—",
      expiresAt: i.expiresAt.toISOString(),
      createdAt: i.createdAt.toISOString(),
    })),
    activeAdminCount,
    tooManyAdmins: activeAdminCount > ADMIN_COUNT_WARNING_THRESHOLD,
    warningThreshold: ADMIN_COUNT_WARNING_THRESHOLD,
  };
}

export type AdminInvitePeekStatus =
  | "valid"
  | "invalid"
  | "expired"
  | "used"
  | "revoked";

export type AdminInvitePeek = {
  status: AdminInvitePeekStatus;
  email: string | null;
  /** Prefilled name suggestion for the accept form (may be empty). */
  name: string | null;
};

/**
 * Non-consuming read of an invite by its plaintext token, for rendering the
 * public accept page. Acceptance itself happens via the POST endpoint, which
 * re-validates under a transaction (so this is safe to call on every page load).
 */
export async function peekAdminInvite(token: string): Promise<AdminInvitePeek> {
  if (!token) return { status: "invalid", email: null, name: null };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invite = await prisma.adminInvite.findUnique({
    where: { tokenHash },
    select: {
      email: true,
      name: true,
      acceptedAt: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  if (!invite) return { status: "invalid", email: null, name: null };
  if (invite.revokedAt) return { status: "revoked", email: invite.email, name: invite.name };
  if (invite.acceptedAt) return { status: "used", email: invite.email, name: invite.name };
  if (invite.expiresAt.getTime() <= Date.now()) {
    return { status: "expired", email: invite.email, name: invite.name };
  }
  return { status: "valid", email: invite.email, name: invite.name };
}
