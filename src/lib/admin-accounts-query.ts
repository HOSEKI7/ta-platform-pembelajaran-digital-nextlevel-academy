/**
 * Neutral (non-"use client", non-"server-only") module holding the shared
 * TanStack Query key for the admin-accounts page. Importable by BOTH the server
 * page (prefetch) and the client hooks. Keeping it out of the "use client" hook
 * file matters: a Server Component importing a value from a client module gets a
 * client-reference proxy, not the real array — which TanStack rejects ("queryKey
 * needs to be an Array").
 */
export const adminAccountsKey = ["admin", "admins"] as const;
