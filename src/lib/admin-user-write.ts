import "server-only";

import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";

import { Role, type Gender } from "@/generated/prisma";
import { generateNomorInduk } from "@/lib/nomor-induk";
import { prisma } from "@/lib/prisma";

/**
 * Server-side helpers for admin-managed accounts (PRD §6.11.4). Route handlers
 * stay thin by delegating user/account creation + password resets here.
 *
 * Password hashing uses Better Auth's own `hashPassword` (default scrypt). Since
 * `auth.ts` does not override `emailAndPassword.password.hash`, this produces the
 * exact hash format the sign-in verifier expects.
 */

/** Duck-typed P2002 check (the generated client / Prisma namespace can resolve
 *  to different bundle copies under Turbopack — see CLAUDE.md gotcha). */
export function isUniqueError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

function genId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

export type CreateManagedUserInput = {
  role: Role;
  name: string;
  email: string;
  password: string;
  classId?: string;
  institution?: string | null;
  /** Mentor-only; honored only when role is MENTOR. */
  gender?: Gender | null;
};

export type CreateUserResult =
  | { ok: true; id: string; nomorInduk?: string }
  | { ok: false; status: number; error: string };

/**
 * Creates an admin-managed account (User + credential Account + role profile),
 * auto-verified so the user can log in immediately with the initial password.
 * Magang/Mentor get a Class assignment; Magang enforces the per-class quota
 * (`Class.maxStudents`). Peserta Didik gets a fresh `UserGameProfile`.
 */
export async function createManagedUser(
  input: CreateManagedUserInput,
): Promise<CreateUserResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, status: 409, error: "Email sudah terdaftar." };
  }

  const needsClass = input.role === Role.PESERTA_MAGANG || input.role === Role.MENTOR;
  if (needsClass && !input.classId) {
    return { ok: false, status: 400, error: "Kelas wajib dipilih." };
  }

  if (needsClass && input.classId) {
    const cls = await prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, maxStudents: true },
    });
    if (!cls) return { ok: false, status: 400, error: "Kelas tidak ditemukan." };

    if (input.role === Role.PESERTA_MAGANG) {
      const count = await prisma.internshipProfile.count({
        where: { classId: cls.id },
      });
      if (count >= cls.maxStudents) {
        return {
          ok: false,
          status: 409,
          error: `Kelas sudah penuh (maks ${cls.maxStudents} peserta magang).`,
        };
      }
    }
  }

  const passwordHash = await hashPassword(input.password);
  const userId = genId("user");
  const now = new Date();
  let nomorInduk: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          name: input.name.trim(),
          role: input.role,
          emailVerified: true, // admin-created → skip the verification flow
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      });

      await tx.account.create({
        data: {
          id: genId("acc"),
          userId,
          accountId: userId, // Better Auth convention for email/password
          providerId: "credential",
          password: passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      });

      if (input.role === Role.PESERTA_DIDIK) {
        await tx.userGameProfile.create({ data: { userId } });
      } else if (input.role === Role.PESERTA_MAGANG) {
        const classInfo = await tx.class.findUniqueOrThrow({
          where: { id: input.classId! },
          select: {
            field: {
              select: {
                kode_bidang: true,
                batch: { select: { id: true, kode_batch: true } },
              },
            },
          },
        });

        if (!classInfo.field.kode_bidang || !classInfo.field.batch.kode_batch) {
          throw new Error("Batch atau Bidang belum memiliki kode. Isi kode batch/bidang terlebih dahulu.");
        }

        const generatedNomorInduk = await generateNomorInduk(
          tx,
          classInfo.field.batch.id,
          classInfo.field.batch.kode_batch,
          classInfo.field.kode_bidang,
        );

        await tx.internshipProfile.create({
          data: {
            userId,
            classId: input.classId!,
            nomor_induk: generatedNomorInduk,
            institution: input.institution?.trim() || null,
          },
        });
        nomorInduk = generatedNomorInduk;
      } else if (input.role === Role.MENTOR) {
        await tx.mentorProfile.create({
          data: { userId, classId: input.classId!, gender: input.gender ?? null },
        });
      }
    });
  } catch (err) {
    if (isUniqueError(err)) {
      return { ok: false, status: 409, error: "Email sudah terdaftar." };
    }
    console.error("[createManagedUser] failed", err);
    return { ok: false, status: 500, error: "Gagal membuat akun. Coba lagi." };
  }

  return { ok: true, id: userId, nomorInduk };
}

/**
 * Sets (or resets) a user's password and revokes all their existing sessions so
 * the old credential can't keep a live session. Creates a credential account row
 * if the user somehow lacks one. When `mustChangePassword` is true the user is
 * forced to change it at next login (admin's temp-password flow).
 */
export async function setUserPassword(
  userId: string,
  plainPassword: string,
  opts?: { mustChangePassword?: boolean },
): Promise<void> {
  const passwordHash = await hashPassword(plainPassword);

  await prisma.$transaction(async (tx) => {
    const account = await tx.account.findFirst({
      where: { userId, providerId: "credential" },
      select: { id: true },
    });

    if (account) {
      await tx.account.update({
        where: { id: account.id },
        data: { password: passwordHash },
      });
    } else {
      await tx.account.create({
        data: {
          id: genId("acc"),
          userId,
          accountId: userId,
          providerId: "credential",
          password: passwordHash,
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: { mustChangePassword: opts?.mustChangePassword ?? false },
    });

    // Revoke live sessions so the previous password is fully invalidated.
    await tx.session.deleteMany({ where: { userId } });
  });
}
