/**
 * Query-key factory for the Peserta-Didik dashboard. Keys are identical on
 * server (prefetch) and client (useQuery) so hydration matches without an
 * extra fetch on first render.
 */

export const studentKeys = {
  all: ["student"] as const,
  gameProfile: () => [...studentKeys.all, "game-profile"] as const,
  dashboard: {
    all: () => [...studentKeys.all, "dashboard"] as const,
    stats: () => [...studentKeys.dashboard.all(), "stats"] as const,
    inProgress: () => [...studentKeys.dashboard.all(), "in-progress"] as const,
    recommendations: () =>
      [...studentKeys.dashboard.all(), "recommendations"] as const,
  },
  myCourses: (filters: { search: string; status: string }) =>
    [...studentKeys.all, "my-courses", filters] as const,
  notifications: () => [...studentKeys.all, "notifications"] as const,
} as const;
