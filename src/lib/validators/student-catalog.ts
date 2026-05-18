import { z } from "zod";

import { SORTS } from "@/lib/student-catalog-query";

export const studentCatalogQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => v ?? ""),
  category: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  sort: z.enum(SORTS).default("latest"),
  page: z.coerce.number().int().min(1).max(999).default(1),
});

export type StudentCatalogQueryInput = z.infer<typeof studentCatalogQuerySchema>;
