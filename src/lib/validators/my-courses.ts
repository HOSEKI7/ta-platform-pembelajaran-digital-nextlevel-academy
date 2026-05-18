import { z } from "zod";

export const MY_COURSES_STATUSES = ["all", "in-progress", "completed"] as const;

export const myCoursesQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, "Pencarian terlalu panjang.")
    .optional()
    .transform((v) => v ?? ""),
  status: z.enum(MY_COURSES_STATUSES).default("all"),
});

export type MyCoursesQuery = z.infer<typeof myCoursesQuerySchema>;
