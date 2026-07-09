type Props = { admin?: boolean };

export function SettingsSkeleton({ admin }: Props) {
  if (admin) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="space-y-1">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          {["profil", "keamanan", "platform", "integrasi"].map((t) => (
            <div key={t} className="h-9 w-28 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="h-72 rounded-xl bg-muted" />
        <div className="space-y-4">
          <div className="h-9 w-64 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-10 w-64 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
