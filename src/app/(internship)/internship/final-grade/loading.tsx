export default function FinalGradeLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-1">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-1 h-7 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* GradeHeroCard skeleton */}
      <div className="h-52 animate-pulse rounded-3xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)] sm:p-10">
        <div className="flex items-baseline gap-3 sm:gap-5">
          <div className="h-24 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 sm:h-36 sm:w-44" />
          <div className="flex flex-col gap-2">
            <div className="h-12 w-14 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* ContextStrip skeleton — 4 cells */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]"
          >
            <div className="size-10 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {/* PerformanceSummary skeleton — 2 KPI cards */}
      <div className="flex flex-col gap-3">
        <div className="h-5 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="h-6 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="h-7 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-1.5 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}