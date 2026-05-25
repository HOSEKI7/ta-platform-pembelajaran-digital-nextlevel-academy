import { z } from "zod";

/**
 * Body for `POST /api/student/me/reward-vouchers/claim`. Only the three PRD
 * §6.7.4 milestone levels are claimable.
 */
export const claimRewardSchema = z.object({
  targetLevel: z.union([z.literal(5), z.literal(10), z.literal(15)], {
    message: "Level milestone tidak valid.",
  }),
});

export type ClaimRewardInput = z.infer<typeof claimRewardSchema>;
