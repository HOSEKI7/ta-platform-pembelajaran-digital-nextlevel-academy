export default function InternshipTasksLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-3xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]"
          >
            <div className="mb-3 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mb-2 h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}