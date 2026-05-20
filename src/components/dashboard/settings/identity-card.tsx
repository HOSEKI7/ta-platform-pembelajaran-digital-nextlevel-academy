"use client";

import { BadgeCheck, CalendarDays, Hash, MailWarning, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  memberSince: string;
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "NL";
}

export function IdentityCard({
  id,
  name,
  username,
  email,
  image,
  emailVerified,
  memberSince,
}: Props) {
  const handle = (username || "username").trim() || "username";
  const shortId = id.slice(0, 8).toUpperCase();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200",
        "shadow-[0_30px_60px_-40px_rgba(35,65,137,0.45)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      {/* Blueprint grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(71,142,244,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(71,142,244,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at top, rgba(0,0,0,0.9), transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top, rgba(0,0,0,0.9), transparent 70%)",
        }}
      />

      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color:var(--color-brand-300)]/30 blur-3xl dark:bg-[color:var(--color-brand-500)]/30"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-50)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <Sparkles className="size-3" strokeWidth={2.4} />
            Pratinjau Identitas
          </span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
            ID·{shortId}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[color:var(--color-brand-500)] via-[color:var(--color-brand-400)] to-[color:var(--color-brand-accent)] opacity-80 blur-[6px]" />
            <Avatar className="relative size-24 ring-4 ring-white dark:ring-[color:var(--color-surface-card)]">
              {image ? <AvatarImage src={image} alt={name} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-[color:var(--color-brand-600)] to-[color:var(--color-brand-400)] text-2xl font-extrabold text-white">
                {initialsOf(name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-heading text-xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
              {name || "Nama lengkap"}
            </p>
            <p className="text-xs font-semibold text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
              @{handle}
            </p>
          </div>

          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-brand-accent)]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-accent)]/40 dark:bg-[color:var(--color-brand-accent)]/15 dark:text-[color:var(--color-brand-accent)] dark:ring-[color:var(--color-brand-accent)]/30">
            Peserta Didik
          </span>
        </div>

        <div className="mt-1 flex flex-col gap-2 rounded-2xl bg-zinc-50/80 p-3 ring-1 ring-zinc-100 dark:bg-white/[0.025] dark:ring-[color:var(--color-surface-border)]">
          <Row
            icon={
              emailVerified ? (
                <BadgeCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.4} />
              ) : (
                <MailWarning className="size-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2.4} />
              )
            }
            label="Email"
            value={
              <span className="flex items-center gap-1.5">
                <span className="truncate">{email}</span>
                {emailVerified ? (
                  <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                    Terverifikasi
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25">
                    Perlu Verifikasi
                  </span>
                )}
              </span>
            }
          />
          <Row
            icon={<CalendarDays className="size-3.5 text-zinc-500" strokeWidth={2.4} />}
            label="Bergabung"
            value={memberSince}
          />
          <Row
            icon={<Hash className="size-3.5 text-zinc-500" strokeWidth={2.4} />}
            label="Handle"
            value={<span className="font-mono">@{handle}</span>}
          />
        </div>

        <p className="rounded-xl border border-dashed border-[color:var(--color-brand-200)] bg-[color:var(--color-brand-50)]/60 px-3 py-2 text-[11px] leading-relaxed text-[color:var(--color-brand-900)] dark:border-[color:var(--color-brand-500)]/30 dark:bg-[color:var(--color-brand-500)]/10 dark:text-[color:var(--color-brand-100)]">
          <span className="font-bold">Catatan:</span> Identitas ini muncul pada
          sertifikat dan halaman verifikasi publik. Tulis dengan ejaan resmi.
        </p>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        {icon}
        {label}
      </span>
      <span className="min-w-0 max-w-[60%] truncate text-right text-[12px] font-semibold text-zinc-800 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}
