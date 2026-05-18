import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

/**
 * QueryClient factory for SSR + browser.
 *
 * Per TanStack's Next.js App Router guide: the server creates a fresh client
 * per request (no cross-request state leak), the browser reuses a single
 * client across the lifetime of the tab.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Match the route handlers' revalidate window so client and server agree
        // on freshness. SSR-prefetched data is "fresh" on first hydration.
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Include in-flight queries so streaming SSR can hydrate them mid-request.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
