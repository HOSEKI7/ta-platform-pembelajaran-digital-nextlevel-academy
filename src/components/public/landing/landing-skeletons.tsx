/**
 * Suspense fallbacks for the data-bound landing sections.
 *
 * Each skeleton mirrors the exact dimensions of its real counterpart so the
 * page does not shift when content resolves. They use a soft brand-tinted
 * shimmer instead of generic grey pulses — keeps the editorial tone of the
 * landing aesthetic.
 */

import { Block, Shimmer } from "@/components/ui/shimmer";

export function HeroStatsSkeleton() {
  return (
    <dl
      aria-busy="true"
      aria-live="polite"
      className="mt-12 grid max-w-lg grid-cols-2 gap-8 border-t border-zinc-200/80 pt-6"
    >
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <Shimmer className="h-3 w-28 rounded" />
          <Shimmer className="mt-3 h-9 w-24 rounded-md" />
        </div>
      ))}
    </dl>
  );
}

export function StatsStripSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col items-start gap-2 px-4 first:pl-0 last:pr-0 sm:px-6"
        >
          {i > 0 ? (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/20 sm:block"
            />
          ) : null}
          <div className="h-9 w-28 overflow-hidden rounded-md bg-white/15 sm:h-10 sm:w-32 relative before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.28)_45%,rgba(244,214,0,0.18)_55%,transparent_75%)] before:[animation:landing-shimmer_1.6s_ease-in-out_infinite]" />
          <div className="h-3 w-24 overflow-hidden rounded bg-white/15 relative before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.28)_45%,rgba(244,214,0,0.18)_55%,transparent_75%)] before:[animation:landing-shimmer_1.6s_ease-in-out_infinite]" />
        </div>
      ))}
    </div>
  );
}

export function FeaturedCoursesSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <article
          key={i}
          className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200/80"
        >
          <Block className="aspect-[16/9] w-full rounded-none rounded-t-3xl" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <Shimmer className="h-4 w-4/5 rounded" />
            <Shimmer className="h-4 w-3/5 rounded" />
            <div className="mt-3 flex items-center gap-3">
              <Shimmer className="size-5 rounded-full" />
              <Shimmer className="h-3 w-24 rounded" />
              <Shimmer className="size-1 rounded-full" />
              <Shimmer className="h-3 w-20 rounded" />
            </div>
            <div className="mt-auto flex items-end justify-between pt-5">
              <div className="space-y-1.5">
                <Shimmer className="h-3 w-16 rounded" />
                <Shimmer className="h-6 w-28 rounded-md" />
              </div>
              <Shimmer className="size-10 rounded-full" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
