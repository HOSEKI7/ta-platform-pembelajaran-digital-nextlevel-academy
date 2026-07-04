import { cache } from "react";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: uses React `cache()` so layout + pages in the same request share one
 * QueryClient — prefetches from the layout hydrate components mounted above
 * the page's `<HydrationBoundary>` (e.g. LevelChip, NotificationsButton).
 * Browser: singleton across the tab lifetime.
 */
export const getQueryClient: () => QueryClient = isServer
  ? cache(makeQueryClient)
  : () => (browserQueryClient ??= makeQueryClient());
