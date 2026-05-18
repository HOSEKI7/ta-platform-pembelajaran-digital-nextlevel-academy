import { cn } from "@/lib/utils";

/**
 * Shared shimmer primitives used by every skeleton across the app.
 *
 * The `landing-shimmer` keyframe (defined in globals.css) animates a
 * brand-blue → accent-yellow stripe left-to-right. Both `Shimmer` (rounded
 * pill / line) and `Block` (rectangular surface with a ring) plug into the
 * same animation so loading states feel consistent across surfaces.
 */

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-zinc-100",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(71,142,244,0.18)_45%,rgba(244,214,0,0.12)_55%,transparent_75%)] before:[animation:landing-shimmer_1.6s_ease-in-out_infinite]",
        "dark:bg-zinc-800 dark:before:bg-[linear-gradient(110deg,transparent_25%,rgba(71,142,244,0.28)_45%,rgba(244,214,0,0.18)_55%,transparent_75%)]",
        className,
      )}
    />
  );
}

export function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-zinc-100/85 ring-1 ring-zinc-200/60",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(71,142,244,0.16)_45%,rgba(244,214,0,0.1)_55%,transparent_75%)] before:[animation:landing-shimmer_1.6s_ease-in-out_infinite]",
        "dark:bg-zinc-800/70 dark:ring-zinc-700/60 dark:before:bg-[linear-gradient(110deg,transparent_25%,rgba(71,142,244,0.28)_45%,rgba(244,214,0,0.16)_55%,transparent_75%)]",
        className,
      )}
    />
  );
}
