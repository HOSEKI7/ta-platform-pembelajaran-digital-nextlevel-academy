import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteContainer } from "@/components/public/site-container";

export const metadata = { title: "Blog · Segera hadir" };

export default function BlogIndexPage() {
  return (
    <section className="relative isolate min-h-[calc(100svh-68px)] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(244,214,0,0.18) 0%, transparent 38%)," +
            "radial-gradient(circle at 85% 0%, rgba(71,142,244,0.22) 0%, transparent 42%)," +
            "linear-gradient(180deg, rgba(238,245,255,0.7) 0%, rgba(255,255,255,1) 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[380px] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35,65,137,0.18) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(35,65,137,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      <SiteContainer className="grid place-items-center py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-accent)]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-accent)]/40">
              <Sparkles className="size-3" /> Segera hadir
            </span>
            <h1 className="mt-6 max-w-2xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              Blog NextLevel{" "}
              <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
                sedang kami siapkan.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Sedang menyusun tulisan-tulisan dari tim kurikulum dan mentor —
              panduan praktis, roadmap karir, dan kisah pembelajar. Sementara
              menunggu, eksplor kursus kami atau mulai akun gratis.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-500)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-brand-600)]"
              >
                Lihat kursus
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-[color:var(--color-brand-300)] hover:text-[color:var(--color-brand-700)]"
              >
                Daftar gratis
              </Link>
            </div>
          </div>

          <div className="relative grid place-items-center">
            <div
              aria-hidden
              className="pointer-events-none absolute size-[380px] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(71,142,244,0.28) 0%, transparent 72%)",
                animation: "auth-glow-pulse 4s ease-in-out infinite",
              }}
            />
            <Image
              src="/nla-3d-logo.webp"
              alt=""
              width={320}
              height={320}
              priority
              className="relative drop-shadow-[0_30px_60px_rgba(34,75,174,0.35)]"
              style={{ animation: "auth-logo-float 6s ease-in-out infinite" }}
            />
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
