import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteContainer } from "../site-container";
import { CountUp } from "./count-up";

export function FinalCtaSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <SiteContainer>
        <div
          data-reveal
          data-from="scale"
          className="relative isolate overflow-hidden rounded-[36px] px-8 py-16 text-white sm:px-14 sm:py-20"
          style={{
            background:
              "radial-gradient(circle at 12% 8%, rgba(255,255,255,0.28) 0%, transparent 26%)," +
              "radial-gradient(circle at 88% 92%, var(--color-brand-700) 0%, transparent 46%)," +
              "radial-gradient(circle at 97% 3%, rgba(244,214,0,0.55) 0%, transparent 10%)," +
              "linear-gradient(135deg, var(--color-brand-400) 0%, var(--color-brand-500) 55%, var(--color-brand-300) 100%)",
          }}
        >
          <div className="auth-grid-pattern absolute inset-0 opacity-20" />
          <div className="auth-noise absolute inset-0 opacity-10 mix-blend-overlay" />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-1.5"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 30%, var(--color-brand-accent) 100%)",
              mixBlendMode: "screen",
              opacity: 0.7,
            }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1.5 text-xs font-medium tracking-wide ring-1 ring-white/25 backdrop-blur">
                <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]" />
                Mulai gratis, tanpa kartu kredit
              </span>
              <h2 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Siap naik level?{" "}
                <span className="text-[color:var(--color-brand-accent)]">Mulai hari ini.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90">
                Buat akun gratis dalam 30 detik. Akses kursus pengantar tanpa biaya — bayar hanya
                untuk yang ingin kamu kuasai serius.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-accent)] px-6 py-3.5 text-sm font-bold text-[color:var(--color-brand-900)] shadow-[0_18px_40px_-14px_rgba(244,214,0,0.8)] transition duration-300 hover:translate-y-[-2px] hover:shadow-[0_22px_46px_-14px_rgba(244,214,0,0.95)] active:scale-[0.98]"
                >
                  Daftar Gratis Sekarang
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition duration-300 hover:bg-white/20 active:scale-[0.98]"
                >
                  <Sparkles className="size-4 text-[color:var(--color-brand-accent)]" />
                  Eksplor kursus
                </Link>
              </div>
            </div>

            {/* Right: little gamification "receipt" */}
            <div className="relative">
              <div className="ml-auto max-w-sm rounded-2xl bg-white/95 p-5 text-zinc-900 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/40 backdrop-blur">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  <span>Progress hari ini</span>
                  <span className="font-mono text-[color:var(--color-brand-700)]">#NLA-DEMO</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-heading text-3xl font-extrabold">
                    + <CountUp value={240} /> XP
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--color-success)]">
                    Lv 7 → Lv 8
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="landing-bar-fill h-full w-[72%] rounded-full bg-gradient-to-r from-[color:var(--color-brand-500)] to-[color:var(--color-brand-700)]"
                  />
                </div>
                <ul className="mt-4 space-y-2 text-xs text-zinc-600">
                  <li className="flex items-center justify-between">
                    <span>3 video selesai</span>
                    <span className="font-semibold text-[color:var(--color-brand-700)]">+45 XP</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>1 quiz lulus pertama</span>
                    <span className="font-semibold text-[color:var(--color-brand-700)]">+90 XP</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Voucher unlocked</span>
                    <span className="rounded-full bg-[color:var(--color-brand-accent)] px-2 py-0.5 font-bold text-[10px] text-[color:var(--color-brand-900)]">
                      −20%
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
