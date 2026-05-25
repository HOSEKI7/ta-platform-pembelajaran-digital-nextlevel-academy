export const TRANSACTIONS_PAGE_SIZES = [10, 25, 50] as const;
export const TRANSACTIONS_SORT_VALUES = ["asc", "desc"] as const;

export type TransactionsPageSize = (typeof TRANSACTIONS_PAGE_SIZES)[number];
export type TransactionsSort = (typeof TRANSACTIONS_SORT_VALUES)[number];
