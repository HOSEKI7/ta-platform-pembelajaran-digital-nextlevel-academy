import Image from "next/image";
import { Sparkles, Tag, Trophy } from "lucide-react";

/**
 * Right-side brand panel for the auth split-screen. Pure visual showcase —
 * 3D logo hero surrounded by gamified floaters (XP, level, voucher, progress)
 * that tell the platform story at a glance. Wordmark intentionally lives in
 * the form panel (left) instead of here.
 */
export function AuthBrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:px-12 lg:py-14"
    >
      {/* Base background — light-sky blue with depth at corners.
          Yellow accent gradients are intentionally tiny and tucked into
          opposing corners so they read as brand-identity hints, not as a
          background colour that competes with the slogan's yellow text. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(255,255,255,0.32) 0%, transparent 26%), radial-gradient(circle at 88% 92%, var(--color-brand-600) 0%, transparent 46%), radial-gradient(circle at 97% 3%, rgba(244,214,0,0.55) 0%, transparent 10%), radial-gradient(circle at 4% 97%, rgba(244,214,0,0.28) 0%, transparent 6%), linear-gradient(135deg, var(--color-brand-400) 0%, var(--color-brand-500) 55%, var(--color-brand-300) 100%)",
        }}
      />
      <div className="auth-grid-pattern absolute inset-0 opacity-20" />
      <div className="auth-noise absolute inset-0 opacity-10 mix-blend-overlay" />

      {/* Signature edge band: white at top → yellow at bottom */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1.5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 30%, var(--color-brand-accent) 100%)",
          mixBlendMode: "screen",
          opacity: 0.55,
        }}
      />

      {/* Top spacer — wordmark lives in the form panel */}
      <div className="relative h-10 xl:h-12" />

      {/* CENTER: 3D logo + orbiting floaters */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative">
          {/* Soft glow halo behind the logo */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 38%, transparent 70%)",
              animation: "auth-glow-pulse 3.6s ease-in-out infinite",
            }}
          />

          {/* Ambient ring at top-right */}
          <div
            className="pointer-events-none absolute -right-24 -top-28 size-44 rounded-full border border-white/25"
            style={{
              animation: "auth-drift 14s linear infinite",
              boxShadow: "inset 0 0 80px rgba(255,255,255,0.12)",
            }}
          />

          {/* Ambient soft square at bottom-left */}
          <div
            className="pointer-events-none absolute -left-32 bottom-2 size-24 rotate-12 rounded-2xl border border-white/20"
            style={{
              animation: "auth-drift 18s linear infinite reverse",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0))",
            }}
          />

          {/* 3D logo hero */}
          <Image
            src="/NextLevel_3D_Logo.webp"
            alt=""
            width={420}
            height={420}
            priority
            className="relative drop-shadow-[0_30px_60px_rgba(34,75,174,0.45)]"
            style={{
              animation: "auth-logo-float 6s ease-in-out infinite",
              willChange: "transform",
            }}
          />

          {/* Floaters — spread further from the hero so each side breathes */}
          <FloatChip
            className="-top-14 -right-10"
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
            className="top-[24%] -left-36"
            delay="1.2s"
            tone="voucher"
            shape="ticket"
            icon={<Tag className="size-3.5" strokeWidth={2.4} />}
            label="−20%"
          />
          <FloatChip
            className="top-[60%] -right-36"
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
          <ProgressOrb className="-bottom-14 -right-6" delay="1.8s" value={78} />

          {/* Sparkle dots — scattered further out */}
          <Sparkle className="-top-2 -left-6" delay="0.2s" />
          <Sparkle className="bottom-6 -left-28" delay="0.9s" />
          <Sparkle className="-bottom-6 right-32" delay="1.5s" />
          <Sparkle className="top-1/4 -right-44" delay="1.7s" />
        </div>
      </div>

      {/* BOTTOM-LEFT: slogan block */}
      <div className="relative max-w-md space-y-4 text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1.5 text-xs font-medium tracking-wide ring-1 ring-white/25 backdrop-blur">
          <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]" />
          Belajar dengan pace kamu
        </div>
        <h2 className="font-heading text-3xl font-bold leading-tight xl:text-4xl">
          Elevate Your Skills,{" "}
          <span className="text-[color:var(--color-brand-accent)]">
            Reach the Next Level.
          </span>
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-white/90">
          Kumpulkan EXP, naik level, dan raih sertifikat dari kursus paling
          relevan untuk karir digital di Indonesia.
        </p>
      </div>
    </aside>
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

function FloatChip({
  className,
  delay,
  tone,
  shape = "pill",
  icon,
  label,
}: FloatChipProps) {
  // Muted frosted-glass tones — kept low-contrast so the floaters frame the
  // hero logo instead of competing with it.
  const toneClass =
    tone === "xp"
      ? "bg-white/15 text-white ring-white/35"
      : tone === "voucher"
        ? "bg-white/20 text-white ring-white/35"
        : "bg-[color:var(--color-brand-900)]/30 text-white ring-white/30";

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
      className={`absolute inline-flex items-center gap-1.5 ${shape === "ticket" ? "px-3.5" : "rounded-full px-3"} py-1.5 text-[11px] font-semibold shadow-[0_12px_30px_-14px_rgba(0,0,0,0.5)] ring-1 backdrop-blur ${toneClass} ${className ?? ""}`}
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
      className={`absolute grid size-16 place-items-center rounded-full shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] ${className ?? ""}`}
      style={{
        animation: `auth-orbit 5.5s ease-in-out ${delay} infinite`,
        background: `conic-gradient(rgba(255,255,255,0.85) 0deg ${angle}deg, rgba(255,255,255,0.18) ${angle}deg 360deg)`,
        willChange: "transform",
      }}
    >
      <div className="grid size-[52px] place-items-center rounded-full bg-white/95 text-[color:var(--color-brand-900)] backdrop-blur">
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
      className={`absolute block size-1.5 rounded-full bg-white ${className ?? ""}`}
      style={{
        boxShadow:
          "0 0 14px var(--color-brand-accent), 0 0 24px rgba(255,255,255,0.65)",
        animation: `auth-twinkle 2.4s ease-in-out ${delay} infinite`,
      }}
    />
  );
}
