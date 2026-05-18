import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";

const WIB_TZ = "Asia/Jakarta";

function greetingFor(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

type Props = {
  firstName: string;
};

export function DashboardGreeting({ firstName }: Props) {
  const now = new Date();
  const hour = parseInt(formatInTimeZone(now, WIB_TZ, "H"), 10);
  const dateLabel = formatInTimeZone(now, WIB_TZ, "EEEE, d MMMM yyyy", {
    locale: idLocale,
  });

  return (
    <header className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
        {dateLabel} · WIB
      </p>
      <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        {greetingFor(hour)},{" "}
        <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
          {firstName}
        </span>
        .
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300/80">
        Lanjutkan progresmu, pantau EXP, dan jelajahi kursus baru yang cocok
        dengan minatmu.
      </p>
    </header>
  );
}
