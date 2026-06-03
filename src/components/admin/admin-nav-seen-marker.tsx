"use client";

import { useEffect } from "react";

import type { AdminNavScope } from "@/lib/admin-nav-indicators";
import { useMarkAdminNavSeenMutation } from "@/hooks/use-admin-nav-indicators";

type Props = {
  scope: AdminNavScope;
};

/**
 * Invisible client marker mounted on the admin Users / Transactions list pages.
 * On mount it stamps the corresponding menu as "seen", clearing its sidebar dot
 * (globally, for all admins). Renders nothing.
 */
export function AdminNavSeenMarker({ scope }: Props) {
  const markSeen = useMarkAdminNavSeenMutation();

  useEffect(() => {
    markSeen.mutate(scope);
    // Run once per mount for this scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  return null;
}
