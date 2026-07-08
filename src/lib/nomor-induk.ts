import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma";

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Hash a batchId into a positive 32-bit integer for pg_advisory_xact_lock.
 * Uses MD5 first 8 hex chars → bigint → int4.
 */
export function hashBatchId(batchId: string): number {
  const hash = createHash("md5").update(batchId).digest("hex");
  const big = BigInt(`0x${hash.slice(0, 8)}`);
  return Number(big & BigInt("0x7fffffff")); // ensure positive
}

/**
 * Generate a unique nomor_induk inside an existing transaction.
 *
 * Uses pg_advisory_xact_lock per batch to prevent race conditions.
 * Caller must catch P2002 and retry with fresh sequence.
 */
export async function generateNomorInduk(
  tx: PrismaTransactionClient,
  batchId: string,
  kodeBatch: string,
  kodeBidang: string,
): Promise<string> {
  const lockKey = hashBatchId(batchId);

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

  const count = await tx.internshipProfile.count({
    where: { class: { field: { batchId } } },
  });

  const seq = String(count + 1).padStart(4, "0");
  const nomorInduk = `${kodeBatch}${kodeBidang}${seq}`;

  if (nomorInduk.length !== 9) {
    throw new Error(
      `Generated nomor_induk "${nomorInduk}" is not 9 characters. ` +
        `kode_batch=${kodeBatch} kode_bidang=${kodeBidang} seq=${seq}`,
    );
  }

  // Max 9999 students per batch
  if (count >= 9999) {
    throw new Error(`Batch ${kodeBatch} has reached maximum capacity (9999 students).`);
  }

  return nomorInduk;
}
