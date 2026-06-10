import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Sparkles, Tag, Trophy } from "lucide-react";

import { publicApi } from "@/lib/server-fetch";

import { SiteContainer } from "../site-container";
import { CountUp } from "./count-up";
import { HeroParallax } from "./hero-parallax";
import { HeroStatsSkeleton } from "./landing-skeletons";

export function HeroSection() {
  return (
    <section className="relative isolate flex overflow-hidden pt-10 pb-24 sm:pt-14 lg:min-h-[calc(100svh-var(--nav-h))] lg:items-center lg:py-10">
      <HeroParallax />
      {/* Atmosphere: layered background */}
      <div
        aria-hidden
        data-parallax="0.08"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 85% 12%, rgba(71,142,244,0.20) 0%, transparent 42%)," +
            "radial-gradient(circle at 10% 90%, rgba(244,214,0,0.16) 0%, transparent 38%)," +
            "linear-gradient(180deg, rgba(238,245,255,0.85) 0%, rgba(255,255,255,1) 65%)",
        }}
      />
      <div
        aria-hidden
        data-parallax="0.18"
        className="absolute inset-x-0 top-0 -z-10 h-[420px] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35,65,137,0.18) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(35,65,137,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      <SiteContainer>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:gap-10">
          {/* LEFT: Editorial copy */}
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-200)] backdrop-blur">
              <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]" />
              Belajar dengan pace kamu · WIB
            </span>

            <h1 className="mt-6 font-heading text-[length:var(--fluid-display)] font-extrabold leading-[1.04] tracking-tight text-zinc-900">
              <span className="block">Elevate Your Skills,</span>
              <span className="block">Reach The</span>
              <span className="relative inline-block">
                <span className="landing-gradient-pan bg-clip-text text-transparent [background-image:linear-gradient(110deg,var(--color-brand-700),var(--color-brand-500),var(--color-brand-accent),var(--color-brand-500),var(--color-brand-700))]">
                  Next Level
                </span>
                {/* Yellow "level-up" underline — stroke rises toward the right
                    to echo the gamified level-up motif. */}
                <svg
                  aria-hidden
                  viewBox="0 0 320 26"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2.5 left-0 h-3 w-full text-[color:var(--color-brand-accent)]"
                  fill="none"
                >
                  <path
                    d="M3 22 C 70 18, 150 16, 210 11 S 300 4, 317 3"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[length:var(--fluid-lead)] leading-relaxed text-zinc-600">
              Kumpulkan EXP, naik level, dan raih sertifikat dari kursus paling relevan untuk
              karir digital di Indonesia. Akses seumur hidup — tanpa langganan.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-500)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--color-brand-600)] hover:shadow-[0_22px_48px_-14px_rgba(43,114,234,0.85)] active:scale-[0.98]"
              >
                Mulai Gratis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-brand-300)] hover:text-[color:var(--color-brand-700)] active:scale-[0.98]"
              >
                <BookOpenCheck className="size-4" />
                Lihat Kursus
              </Link>
            </div>

            {/* Trust strip — live counts via API */}
            <Suspense fallback={<HeroStatsSkeleton />}>
              <HeroStats />
            </Suspense>
          </div>

          {/* RIGHT: 3D logo with orbiting chips. Column height is fluid (not a
              fixed 560px) so it scales with the viewport and never forces the
              hero taller than the screen on short desktops. */}
          <div className="relative flex h-[clamp(20rem,38vw,40rem)] items-center justify-center">
            {/* Soft halo */}
            <div
              aria-hidden
              className="pointer-events-none absolute size-[440px] rounded-full sm:size-[520px]"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(71,142,244,0.30) 0%, rgba(71,142,244,0.10) 40%, transparent 72%)",
                animation: "auth-glow-pulse 3.6s ease-in-out infinite",
              }}
            />
            {/* Drifting ring */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-2 top-4 size-44 rounded-full border border-[color:var(--color-brand-300)]/60"
              style={{
                animation: "auth-drift 14s linear infinite",
                boxShadow: "inset 0 0 80px rgba(71,142,244,0.10)",
              }}
            />
            {/* Drifting square */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-4 bottom-10 size-24 rotate-12 rounded-2xl border border-[color:var(--color-brand-200)]"
              style={{
                animation: "auth-drift 18s linear infinite reverse",
                background:
                  "linear-gradient(135deg, rgba(71,142,244,0.08), rgba(255,255,255,0))",
              }}
            />

            <div className="relative">
              <Image
                src="/NextLevel_3D_Logo.webp"
                alt="NextLevel Academy 3D"
                width={460}
                height={460}
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 460px"
                className="relative h-auto w-[clamp(14rem,32vw,30rem)] max-w-full drop-shadow-[0_40px_70px_rgba(34,75,174,0.35)]"
                style={{
                  animation: "auth-logo-float 6s ease-in-out infinite",
                  willChange: "transform",
                }}
              />

              {/* Orbit chips — light-mode variant: white surface, brand-tinted ring */}
              <FloatChip
                className="-top-6 -right-6 sm:-top-8 sm:-right-10"
                delay="0s"
                tone="xp"
                icon={
                  <Sparkles
                    className="size-3.5 text-[color:var(--color-brand-accent)]"
                    strokeWidth={2.4}
                  />
                }
                label="+15 XP"
              />
              <FloatChip
                className="top-[28%] -left-12 sm:-left-20"
                delay="1.2s"
                tone="voucher"
                shape="ticket"
                icon={<Tag className="size-3.5" strokeWidth={2.4} />}
                label="−20%"
              />
              <FloatChip
                className="top-[62%] -right-10 sm:-right-16"
                delay="0.6s"
                tone="level"
                icon={
                  <Trophy
                    className="size-3.5 text-[color:var(--color-brand-accent)]"
                    strokeWidth={2.4}
                  />
                }
                label="Lv 7"
              />
              <ProgressOrb className="-bottom-8 -right-4" delay="1.8s" value={78} />

              {/* Sparkles */}
              <Sparkle className="-top-2 left-6" delay="0.2s" />
              <Sparkle className="bottom-10 -left-10" delay="0.9s" />
              <Sparkle className="-bottom-2 right-24" delay="1.5s" />
              <Sparkle className="top-1/4 -right-20" delay="1.7s" />
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}

async function HeroStats() {
  const { courseCount, learnerCount } = await publicApi<{
    courseCount: number;
    learnerCount: number;
  }>("/api/public/hero-stats");

  return (
    <dl
      data-testid="hero-stats"
      className="mt-8 grid max-w-lg grid-cols-2 gap-8 border-t border-zinc-200/80 pt-6"
    >
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Course tersedia
        </dt>
        <dd className="mt-1 font-heading text-3xl font-extrabold text-zinc-900">
          <CountUp value={courseCount} suffix="+" />
        </dd>
      </div>
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Peserta terdaftar
        </dt>
        <dd className="mt-1 font-heading text-3xl font-extrabold text-zinc-900">
          <CountUp value={learnerCount} suffix="+" />
        </dd>
      </div>
    </dl>
  );
}

type FloatChipProps = {
  className?: string;
  delay: string;
  tone: "xp" | "voucher" | "level";
  shape?: "pill" | "ticket";
  icon: React.ReactNode;
  label: string;
};

function FloatChip({ className, delay, tone, shape = "pill", icon, label }: FloatChipProps) {
  const toneClass =
    tone === "xp"
      ? "bg-white text-[color:var(--color-brand-900)] ring-[color:var(--color-brand-200)]"
      : tone === "voucher"
        ? "bg-white text-[color:var(--color-brand-900)] ring-[color:var(--color-brand-200)]"
        : "bg-[color:var(--color-brand-900)] text-white ring-[color:var(--color-brand-700)]";
  const ticketClip =
    shape === "ticket"
      ? {
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 38%, 95% 50%, 100% 62%, 100% 100%, 0% 100%, 0% 62%, 5% 50%, 0% 38%)",
          borderRadius: "8px",
        }
      : undefined;

  return (
    <div
      className={`absolute inline-flex items-center gap-1.5 ${shape === "ticket" ? "px-3.5" : "rounded-full px-3"} py-1.5 text-[11px] font-semibold shadow-[0_18px_36px_-18px_rgba(35,65,137,0.45)] ring-1 ${toneClass} ${className ?? ""}`}
      style={{
        animation: `auth-orbit 5.5s ease-in-out ${delay} infinite`,
        willChange: "transform",
        ...ticketClip,
      }}
    >
      {icon}
      <span className="tracking-tight">{label}</span>
    </div>
  );
}

function ProgressOrb({
  className,
  delay,
  value,
}: {
  className?: string;
  delay: string;
  value: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = clamped * 3.6;
  return (
    <div
      className={`absolute grid size-16 place-items-center rounded-full shadow-[0_18px_36px_-16px_rgba(35,65,137,0.5)] ${className ?? ""}`}
      style={{
        animation: `auth-orbit 5.5s ease-in-out ${delay} infinite`,
        background: `conic-gradient(var(--color-brand-500) 0deg ${angle}deg, rgba(71,142,244,0.18) ${angle}deg 360deg)`,
        willChange: "transform",
      }}
    >
      <div className="grid size-[52px] place-items-center rounded-full bg-white text-[color:var(--color-brand-900)]">
        <div className="text-center leading-none">
          <div className="text-[13px] font-bold">{clamped}%</div>
          <div className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]/70">
            Progress
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkle({ className, delay }: { className?: string; delay: string }) {
  return (
    <span
      className={`absolute block size-1.5 rounded-full bg-[color:var(--color-brand-500)] ${className ?? ""}`}
      style={{
        boxShadow:
          "0 0 14px var(--color-brand-accent), 0 0 22px rgba(71,142,244,0.55)",
        animation: `auth-twinkle 2.4s ease-in-out ${delay} infinite`,
      }}
    />
  );
}
