import { z } from "zod";

/**
 * Body for the admin force-override of a submission status (PRD §6.11 / §6.9.3).
 * Prisma-free string enum so it stays safe to import on the client too (mirrors
 * `admin-attendance.ts`). `taskId`/`studentId` come from the route params.
 */
export const setSubmissionStatusSchema = z.object({
  status: z.enum(["SUBMITTED", "NOT_SUBMITTED"]),
});

export type SetSubmissionStatusInput = z.infer<typeof setSubmissionStatusSchema>;
