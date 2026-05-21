import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";

import { PageHeader } from "@/components/dashboard/shared/page-header";

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
    <PageHeader
      eyebrow={`${dateLabel} · WIB`}
      title={`${greetingFor(hour)},`}
      accent={firstName}
      description="Lanjutkan progresmu, pantau EXP, dan jelajahi kursus baru yang cocok dengan minatmu."
    />
  );
}
