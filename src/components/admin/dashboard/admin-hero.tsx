"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";
import { Clock, ShoppingBag, UserPlus, Wallet } from "lucide-react";

import { idr } from "@/lib/format";
import type { AdminDashboardData } from "@/lib/admin-dashboard-mock";

const WIB_TZ = "Asia/Jakarta";

function greetingFor(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

type Props = {
  firstName: string;
  /** ISO timestamp captured on the server so the first client render matches. */
  serverNowISO: string;
  today: AdminDashboardData["today"];
};

/**
 * Admin dashboard hero — a platform command-center header. Reuses the visual
 * language of the Mentor hero (gradient + grid pattern + live WIB clock) but
 * swaps the check-in panel for a "today" snapshot (pendapatan, transaksi, user
 * baru) — the pulse an admin scans first thing each day.
 */
export function AdminHero({ firstName, serverNowISO, today }: Props) {
  const [now, setNow] = useState<Date>(() => new Date(serverNowISO));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = parseInt(formatInTimeZone(now, WIB_TZ, "H"), 10);
  const dateLabel = formatInTimeZone(now, WIB_TZ, "EEEE, d MMMM yyyy", {
    locale: idLocale,
  });
  const clock = formatInTimeZone(now, WIB_TZ, "HH:mm:ss");

  const snapshot = [
    {
      icon: Wallet,
      label: "Pendapatan",
      value: idr.format(today.revenue),
    },
    {
      icon: ShoppingBag,
      label: "Transaksi",
      value: `${today.transactions}`,
    },
    {
      icon: UserPlus,
      label: "User baru",
      value: `${today.newUsers}`,
    },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-[28px] text-white shadow-[0_30px_70px_-40px_rgba(35,65,137,0.7)]"
      style={{
        background:
          "radial-gradient(circle at 90% -10%, rgba(244,214,0,0.45) 0%, transparent 30%)," +
          "radial-gradient(circle at 8% 120%, rgba(71,142,244,0.55) 0%, transparent 38%)," +
          "linear-gradient(135deg, var(--color-brand-800) 0%, var(--color-brand-600) 55%, var(--color-brand-500) 100%)",
      }}
    >
      <div className="auth-grid-pattern absolute inset-0 opacity-[0.12]" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:p-10">
        {/* Left: greeting + live clock */}
        <div className="flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
            {dateLabel} · WIB
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {greetingFor(hour)},{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #fff 0%, var(--color-brand-accent-soft) 100%)",
              }}
            >
              {firstName}
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
            Pantau denyut platform hari ini — pendapatan, transaksi, dan
            pertumbuhan pengguna dalam satu layar.
          </p>

          <div className="mt-5 flex items-center gap-2.5 text-white/80">
            <Clock className="size-4" strokeWidth={2.2} />
            <span className="font-heading text-2xl font-extrabold tabular-nums tracking-tight text-white sm:text-3xl">
              {clock}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              WIB
            </span>
          </div>
        </div>

        {/* Right: today snapshot */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white/[0.08] p-5 ring-1 ring-white/15 backdrop-blur-md sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            Ringkasan hari ini
          </p>
          <div className="grid gap-3">
            {snapshot.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-white ring-1 ring-white/15">
                  <s.icon className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading text-xl font-extrabold leading-none tabular-nums">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
