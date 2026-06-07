/**
 * Skeleton fallbacks for every data-bound dashboard surface. Each skeleton
 * matches the real component's dimensions to prevent layout shift on swap.
 */

import { Block, Shimmer } from "@/components/ui/shimmer";

export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <Shimmer className="h-3 w-24 rounded" />
      <Shimmer className="mt-4 h-10 w-20 rounded-md" />
      <Shimmer className="mt-2 h-3 w-32 rounded" />
    </div>
  );
}

export function StatsRowSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function InProgressCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <Block className="aspect-[16/9] w-full rounded-none rounded-t-3xl" />
      <div className="space-y-3 p-5">
        <Shimmer className="h-4 w-4/5 rounded" />
        <Shimmer className="h-3 w-3/5 rounded" />
        <div className="space-y-2 pt-2">
          <Shimmer className="h-2 w-full rounded-full" />
          <Shimmer className="h-3 w-24 rounded" />
        </div>
      </div>
    </article>
  );
}

export function InProgressGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <InProgressCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecommendedCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
      <Block className="aspect-[16/9] w-full rounded-none rounded-t-3xl" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Shimmer className="h-4 w-4/5 rounded" />
        <Shimmer className="h-3 w-2/3 rounded" />
        <div className="mt-auto flex items-end justify-between pt-3">
          <Shimmer className="h-5 w-24 rounded-md" />
          <Shimmer className="size-9 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function RecommendationsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <RecommendedCardSkeleton key={i} />
      ))}
    </div>
  );
}
