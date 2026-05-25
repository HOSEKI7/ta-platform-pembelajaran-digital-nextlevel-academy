import { z } from "zod";

export const TRANSACTIONS_PAGE_SIZES = [10, 25, 50] as const;
export const TRANSACTIONS_SORT_VALUES = ["asc", "desc"] as const;

export type TransactionsPageSize = (typeof TRANSACTIONS_PAGE_SIZES)[number];
export type TransactionsSort = (typeof TRANSACTIONS_SORT_VALUES)[number];

export const transactionsQuerySchema = z.object({
  sort: z.enum(TRANSACTIONS_SORT_VALUES).default("desc"),
  pageSize: z.coerce
    .number()
    .int()
    .refine(
      (n): n is TransactionsPageSize =>
        (TRANSACTIONS_PAGE_SIZES as readonly number[]).includes(n),
      { message: "pageSize tidak valid." },
    )
    .default(10),
  page: z.coerce.number().int().min(1, "Halaman minimal 1.").default(1),
});

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
