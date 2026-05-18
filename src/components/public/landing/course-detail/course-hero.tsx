import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

import { SiteContainer } from "@/components/public/site-container";

import { EnrollButton } from "./enroll-button";

type Props = {
  title: string;
  shortDescription: string | null;
  description: string;
  thumbnailUrl: string;
  category: { name: string };
  instructor: string;
  price: number;
  fakePrice: number | null;
  estimatedDuration: number | null;
  totalSteps: number;
  enrollHref: string;
};

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function summary(short: string | null, long: string): string {
  if (short && short.trim().length > 0) return short;
  // Fallback: first ~180 chars of long description, cut at sentence boundary.
  const truncated = long.slice(0, 200);
  const lastDot = truncated.lastIndexOf(". ");
  return lastDot > 60 ? truncated.slice(0, lastDot + 1) : truncated + (long.length > 200 ? "…" : "");
}

function durationText(min: number | null): string {
  if (!min) return "Akses seumur hidup";
  if (min < 60) return `${min} menit`;
  const h = Math.round(min / 60);
  return `${h} jam`;
}

export function CourseHero({
  title,
  shortDescription,
  description,
  thumbnailUrl,
  category,
  instructor,
  price,
  fakePrice,
  estimatedDuration,
  totalSteps,
  enrollHref,
}: Props) {
  const hasDiscount = fakePrice && fakePrice > price;
  const discountPct = hasDiscount ? Math.round(((fakePrice! - price) / fakePrice!) * 100) : 0;

  return (
    <section className="relative isolate overflow-hidden pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 85% 12%, rgba(71,142,244,0.22) 0%, transparent 42%)," +
            "radial-gradient(circle at 8% 92%, rgba(244,214,0,0.16) 0%, transparent 38%)," +
            "linear-gradient(180deg, rgba(238,245,255,0.85) 0%, rgba(255,255,255,1) 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[380px] opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(35,65,137,0.18) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(35,65,137,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      <SiteContainer>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
          <Link href="/" className="hover:text-zinc-900">
            Beranda
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/courses" className="hover:text-zinc-900">
            Kursus
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-zinc-900 line-clamp-1">{title}</span>
        </nav>

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* LEFT: copy + CTA */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-800)] ring-1 ring-[color:var(--color-brand-200)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              {category.name}
            </span>

            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-[56px]">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              {summary(shortDescription, description)}
            </p>

            {/* Meta row */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600">
              <li className="inline-flex items-center gap-1.5">
                <span className="grid size-5 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[10px] font-bold text-[color:var(--color-brand-800)]">
                  {instructor[0]?.toUpperCase() ?? "N"}
                </span>
                <span>oleh <span className="font-semibold text-zinc-900">{instructor}</span></span>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-[color:var(--color-brand-600)]" />
                {durationText(estimatedDuration)}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
                {totalSteps} materi
              </li>
            </ul>

            {/* Price + CTAs */}
            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-end">
              <div>
                {hasDiscount ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-400 line-through">{idr.format(fakePrice!)}</span>
                    <span className="rounded-full bg-[color:var(--color-brand-accent)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--color-brand-900)]">
                      Hemat {discountPct}%
                    </span>
                  </div>
                ) : null}
                <div className="mt-1 font-heading text-3xl font-extrabold text-zinc-900 sm:text-4xl">
                  {idr.format(price)}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Bayar sekali · akses seumur hidup
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <EnrollButton href={enrollHref} />
                <a
                  href="#kurikulum"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition hover:border-[color:var(--color-brand-300)] hover:text-[color:var(--color-brand-700)]"
                >
                  Lihat kurikulum
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: image card */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_40px_80px_-30px_rgba(35,65,137,0.45)] ring-1 ring-zinc-200">
              <div className="relative aspect-[16/10]">
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                  unoptimized
                />
                {/* Floating gamification chip */}
                <span
                  className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(35,65,137,0.5)] backdrop-blur"
                  style={{ animation: "auth-orbit 5.5s ease-in-out infinite" }}
                >
                  <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)]" />
                  +600 XP saat selesai
                </span>
              </div>
            </div>
            {/* Decorative orbiting square */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-8 -right-6 size-20 rotate-12 rounded-2xl border border-[color:var(--color-brand-200)] bg-white/40 backdrop-blur"
              style={{ animation: "auth-drift 18s linear infinite reverse" }}
            />
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
