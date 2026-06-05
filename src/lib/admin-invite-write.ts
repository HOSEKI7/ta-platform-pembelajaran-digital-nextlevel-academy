import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";

import { Role } from "@/generated/prisma";
import { AdminInviteEmail } from "@/emails/admin-invite";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { isUniqueError } from "@/lib/admin-user-write";

/**
 * Server-side write helpers for managing administrator accounts (PRD §6.11.12):
 * email invites (single-use, 24h), invite acceptance (creates the User), invite
 * revocation, and activate/deactivate/soft-delete of existing admins.
 *
 * Invariant enforced here (never in the UI alone): the system must always retain
 * at least one ACTIVE administrator. Self-targeting is also blocked.
 */

function genId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

/** Opaque, URL-safe invite token. Only its SHA-256 is persisted. */
function generateInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

type AuditCtx = { ip?: string | null; ua?: string | null };

/** Count of active, non-deleted administrators, optionally excluding one id. */
async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: Role.ADMINISTRATOR,
      isActive: true,
      deletedAt: null,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

// ---- Invite creation --------------------------------------------------------

export type CreateAdminInviteInput = {
  email: string;
  name?: string | null;
  invitedById: string;
  inviterName: string;
} & AuditCtx;

export type CreateAdminInviteResult =
  | { ok: true; inviteId: string; inviteUrl: string; emailDryRun: boolean }
  | { ok: false; status: number; error: string };

export async function createAdminInvite(
  input: CreateAdminInviteInput,
): Promise<CreateAdminInviteResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;

  // Reject if the email already belongs to any account (active or soft-deleted) —
  // acceptance creates a fresh User and `email` is globally unique.
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, deletedAt: true },
  });
  if (existingUser) {
    const asAdmin =
      existingUser.role === Role.ADMINISTRATOR && !existingUser.deletedAt;
    return {
      ok: false,
      status: 409,
      error: asAdmin
        ? "Email ini sudah menjadi administrator."
        : "Email ini sudah terdaftar sebagai pengguna lain.",
    };
  }

  // Reject if a still-valid invite is already outstanding for this email.
  const pending = await prisma.adminInvite.findFirst({
    where: {
      email,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });
  if (pending) {
    return {
      ok: false,
      status: 409,
      error: "Undangan untuk email ini masih aktif. Batalkan dulu untuk mengirim ulang.",
    };
  }

  const { token, tokenHash } = generateInviteToken();
  const expiryHours = env.adminInvite.expiryHours();
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  let inviteId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const invite = await tx.adminInvite.create({
        data: {
          email,
          name,
          tokenHash,
          invitedById: input.invitedById,
          expiresAt,
        },
        select: { id: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: input.invitedById,
          action: "ADMIN_INVITE_CREATE",
          entityType: "AdminInvite",
          entityId: invite.id,
          metadata: { email, expiresAt: expiresAt.toISOString() },
          ipAddress: input.ip ?? undefined,
          userAgent: input.ua ?? undefined,
        },
      });
      return invite;
    });
    inviteId = created.id;
  } catch (err) {
    console.error("[createAdminInvite] failed", err);
    return { ok: false, status: 500, error: "Gagal membuat undangan. Coba lagi." };
  }

  const inviteUrl = `${env.appUrl()}/undang-admin/terima?token=${token}`;

  let emailDryRun = false;
  try {
    const result = await sendEmail({
      to: email,
      subject: "Undangan Administrator — NextLevel Academy",
      react: AdminInviteEmail({
        inviterName: input.inviterName,
        inviteUrl,
        expiryHours,
      }),
    });
    emailDryRun = "dryRun" in result;
  } catch (err) {
    // Email failed but the invite row exists — surface the URL via logs so the
    // admin can still deliver it manually; don't fail the whole request.
    console.error("[createAdminInvite] email send failed", err);
    emailDryRun = true;
  }

  if (emailDryRun) {
    console.warn(`[admin-invite] invite URL for ${email}: ${inviteUrl}`);
  }

  return { ok: true, inviteId, inviteUrl, emailDryRun };
}

// ---- Invite acceptance (creates the User) -----------------------------------

export type AcceptAdminInviteInput = {
  token: string;
  name: string;
  password: string;
} & AuditCtx;

export type AcceptAdminInviteResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: number; error: string };

export async function acceptAdminInvite(
  input: AcceptAdminInviteInput,
): Promise<AcceptAdminInviteResult> {
  const tokenHash = hashToken(input.token);
  const invite = await prisma.adminInvite.findUnique({
    where: { tokenHash },
    select: { id: true, email: true, acceptedAt: true, revokedAt: true, expiresAt: true },
  });

  if (!invite) {
    return { ok: false, status: 404, error: "Undangan tidak ditemukan atau tidak valid." };
  }
  if (invite.revokedAt) {
    return { ok: false, status: 410, error: "Undangan ini telah dibatalkan." };
  }
  if (invite.acceptedAt) {
    return { ok: false, status: 410, error: "Undangan ini sudah pernah digunakan." };
  }
  if (invite.expiresAt.getTime() <= Date.now()) {
    return { ok: false, status: 410, error: "Undangan ini sudah kedaluwarsa." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  });
  if (existingUser) {
    return { ok: false, status: 409, error: "Email ini sudah terdaftar sebagai pengguna." };
  }

  const userId = genId("user");
  const now = new Date();
  const passwordHash = await hashPassword(input.password);

  try {
    await prisma.$transaction(async (tx) => {
      // Guard against a double-accept race: re-check the invite is still open.
      const fresh = await tx.adminInvite.findUnique({
        where: { id: invite.id },
        select: { acceptedAt: true, revokedAt: true },
      });
      if (fresh?.acceptedAt || fresh?.revokedAt) {
        throw new Error("INVITE_NO_LONGER_OPEN");
      }

      await tx.user.create({
        data: {
          id: userId,
          email: invite.email,
          name: input.name.trim(),
          role: Role.ADMINISTRATOR,
          emailVerified: true,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      });
      await tx.account.create({
        data: {
          id: genId("acc"),
          userId,
          accountId: userId,
          providerId: "credential",
          password: passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      });
      await tx.adminInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: now, acceptedUserId: userId },
      });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "ADMIN_INVITE_ACCEPT",
          entityType: "AdminInvite",
          entityId: invite.id,
          metadata: { email: invite.email },
          ipAddress: input.ip ?? undefined,
          userAgent: input.ua ?? undefined,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INVITE_NO_LONGER_OPEN") {
      return { ok: false, status: 410, error: "Undangan ini sudah tidak berlaku." };
    }
    if (isUniqueError(err)) {
      return { ok: false, status: 409, error: "Email ini sudah terdaftar sebagai pengguna." };
    }
    console.error("[acceptAdminInvite] failed", err);
    return { ok: false, status: 500, error: "Gagal menyelesaikan undangan. Coba lagi." };
  }

  return { ok: true, userId, email: invite.email };
}

// ---- Invite revocation ------------------------------------------------------

export type AdminWriteResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function revokeAdminInvite(
  inviteId: string,
  actorId: string,
  ctx?: AuditCtx,
): Promise<AdminWriteResult> {
  const invite = await prisma.adminInvite.findUnique({
    where: { id: inviteId },
    select: { id: true, email: true, acceptedAt: true, revokedAt: true },
  });
  if (!invite) return { ok: false, status: 404, error: "Undangan tidak ditemukan." };
  if (invite.acceptedAt) {
    return { ok: false, status: 409, error: "Undangan sudah diterima, tidak bisa dibatalkan." };
  }
  if (invite.revokedAt) return { ok: true }; // idempotent

  await prisma.$transaction([
    prisma.adminInvite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date(), revokedById: actorId },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        action: "ADMIN_INVITE_REVOKE",
        entityType: "AdminInvite",
        entityId: inviteId,
        metadata: { email: invite.email },
        ipAddress: ctx?.ip ?? undefined,
        userAgent: ctx?.ua ?? undefined,
      },
    }),
  ]);

  return { ok: true };
}

// ---- Activate / deactivate --------------------------------------------------

export async function setAdminActive(
  targetId: string,
  isActive: boolean,
  actorId: string,
  ctx?: AuditCtx,
): Promise<AdminWriteResult> {
  if (targetId === actorId) {
    return { ok: false, status: 403, error: "Anda tidak bisa mengubah status akun sendiri." };
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, role: Role.ADMINISTRATOR, deletedAt: null },
    select: { id: true, isActive: true },
  });
  if (!target) return { ok: false, status: 404, error: "Administrator tidak ditemukan." };

  if (!isActive) {
    const activeOthers = await countActiveAdmins(targetId);
    if (activeOthers === 0) {
      return {
        ok: false,
        status: 409,
        error: "Tidak bisa menonaktifkan administrator aktif terakhir.",
      };
    }
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: targetId }, data: { isActive } }),
    ...(!isActive
      ? [prisma.session.deleteMany({ where: { userId: targetId } })]
      : []),
    prisma.auditLog.create({
      data: {
        actorId,
        action: "ADMIN_STATUS_CHANGE",
        entityType: "User",
        entityId: targetId,
        metadata: { isActive },
        ipAddress: ctx?.ip ?? undefined,
        userAgent: ctx?.ua ?? undefined,
      },
    }),
  ]);

  return { ok: true };
}

// ---- Soft delete ------------------------------------------------------------

export async function softDeleteAdmin(
  targetId: string,
  actorId: string,
  ctx?: AuditCtx,
): Promise<AdminWriteResult> {
  if (targetId === actorId) {
    return { ok: false, status: 403, error: "Anda tidak bisa menghapus akun sendiri." };
  }

  const target = await prisma.user.findFirst({
    where: { id: targetId, role: Role.ADMINISTRATOR, deletedAt: null },
    select: { id: true },
  });
  if (!target) return { ok: false, status: 404, error: "Administrator tidak ditemukan." };

  // Must leave at least one active admin standing after removal.
  const activeOthers = await countActiveAdmins(targetId);
  if (activeOthers === 0) {
    return {
      ok: false,
      status: 409,
      error: "Tidak bisa menghapus administrator aktif terakhir.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetId },
      data: { deletedAt: new Date(), isActive: false },
    }),
    prisma.session.deleteMany({ where: { userId: targetId } }),
    prisma.auditLog.create({
      data: {
        actorId,
        action: "ADMIN_DELETE",
        entityType: "User",
        entityId: targetId,
        ipAddress: ctx?.ip ?? undefined,
        userAgent: ctx?.ua ?? undefined,
      },
    }),
  ]);

  return { ok: true };
}
