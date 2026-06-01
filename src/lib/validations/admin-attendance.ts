import { z } from "zod";

/**
 * Shared validation for the admin attendance override (PRD §6.11 / §6.9.2).
 * Pure string enums (Prisma-free) so the schema is safe in any bundle — mirrors
 * the `admin-voucher` / `admin-badge` convention. The server resolves the
 * date/working-day rules in `admin-attendance-write.ts`.
 */
export const setAttendanceSchema = z.object({
  scope: z.enum(["mentor", "student"]),
  userId: z.string().min(1, "userId wajib diisi."),
  /** date-only "yyyy-MM-dd" (WIB calendar date). */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid."),
  /** Only settable states — BELUM is derived and never written. */
  status: z.enum(["HADIR", "TIDAK_HADIR"]),
});

export type SetAttendanceInput = z.infer<typeof setAttendanceSchema>;
