import { Role } from "@/generated/prisma";
import { requireRole } from "@/lib/auth-server";
import "./player.css";

/**
 * Fullscreen Course Player shell — no DashboardShell, no sidebar, no
 * dashboard topbar. Mirrors the precedent set by `src/app/(checkout)/`:
 * a sibling route group with stripped chrome to keep the user focused on
 * one task (here: learning a step).
 *
 * Theme handling is inherited from the global `ThemeProvider` mounted at the
 * root layout — the topbar inside the player imports the same `<ThemeToggle />`
 * the dashboard uses, so toggles propagate to `<html class="dark">` and the
 * rest of the app picks up the new theme on the next navigation.
 */
export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(Role.PESERTA_DIDIK, { redirectTo: "/dashboard" });

  return (
    <div className="relative isolate min-h-screen w-full bg-[color:var(--player-stage)] text-foreground">
      {children}
    </div>
  );
}
