import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Gauge, Sparkles, Users } from "lucide-react";

import { loadPlatformInfo } from "@/lib/platform-info";
import { SiteContainer } from "@/components/public/site-container";
import Logo3D from "@/assets/images/nla-3d-logo.webp";

export const metadata = { title: "Tentang Kami" };
export const revalidate = 300;

const PILLARS = [
  {
    icon: Compass,
    title: "Progresif",
    body: "Tiap kursus dirancang melangkah maju dari konsep ke praktik, dengan checkpoint yang jelas.",
  },
  {
    icon: Gauge,
    title: "Terukur",
    body: "EXP, level, dan completion rate memberi sinyal pasti tentang sejauh mana skill kamu berkembang.",
  },
  {
    icon: Sparkles,
    title: "Menyenangkan",
    body: "Belajar tidak harus terasa berat — sistem reward kami memastikan tiap sesi terasa worth-it.",
  },
];

type TeamMemberView = { name: string; role: string; initials: string };

// Shown only when an admin hasn't filled in the Tim list under Informasi
// Platform (PRD §6.11.11), so the section never renders empty.
const FALLBACK_TEAM: TeamMemberView[] = [
  { initials: "KA", name: "Kevin Arya Swardhana", role: "Founder / CEO" },
  { initials: "MI", name: "Muhammad Ikhsan", role: "Co-Founder / DEPUTY CEO" },
  { initials: "FR", name: "Fachrizy Al Rasyid", role: "Co-Founder / CMO" },
  { initials: "FZ", name: "Farid Zahran", role: "Co-Founder / CTO" },
];

/** First letters of the first two words, e.g. "Farid Zahran" → "FZ". */
function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = (parts[0][0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "");
  return letters.toUpperCase() || "?";
}

export default async function AboutPage() {
  const info = await loadPlatformInfo();
  const team: TeamMemberView[] =
    info.tim.length > 0
      ? info.tim.map((m) => ({
          name: m.nama,
          role: m.posisi,
          initials: toInitials(m.nama),
        }))
      : FALLBACK_TEAM;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-16 pb-20 sm:pt-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 85% 12%, rgba(71,142,244,0.18) 0%, transparent 42%)," +
              "radial-gradient(circle at 10% 90%, rgba(244,214,0,0.14) 0%, transparent 38%)," +
              "linear-gradient(180deg, rgba(238,245,255,0.7) 0%, rgba(255,255,255,1) 65%)",
          }}
        />

        <SiteContainer>
          <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-[color:var(--color-brand-900)] ring-1 ring-[color:var(--color-brand-200)] backdrop-blur">
                <span className="size-1.5 rounded-full bg-[color:var(--color-brand-accent)]" />
                Tentang NextLevel
              </span>
              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                Kami ingin belajar terasa{" "}
                <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
                  progresif, terukur, dan menyenangkan.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                NextLevel Academy adalah platform pembelajaran digital untuk
                pelajar dan profesional muda di Indonesia. Kami menggabungkan
                kursus berkualitas dengan sistem gamifikasi yang membuat tiap
                sesi terasa seperti naik level.
              </p>
            </div>

            <div className="relative grid place-items-center">
              <div
                aria-hidden
                className="pointer-events-none absolute size-[360px] rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(71,142,244,0.25) 0%, transparent 72%)",
                  animation: "auth-glow-pulse 4s ease-in-out infinite",
                }}
              />
              <Image
                src={Logo3D} placeholder="blur"
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

      {/* Mission / Vision */}
      <section className="py-16">
        <SiteContainer>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-zinc-200 sm:p-10">
              <span
                aria-hidden
                className="absolute -right-6 -top-6 h-16 w-16 rotate-45 bg-[color:var(--color-brand-accent)]/85"
              />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
                Visi
              </h2>
              <p className="mt-3 font-heading text-xl font-bold leading-snug text-zinc-900">
                Menjadi platform pembelajaran digital terpercaya di Indonesia
                yang membuat pengalaman belajar terasa progresif, terukur, dan
                menyenangkan melalui pendekatan gamifikasi yang unik.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-[color:var(--color-brand-50)] p-8 ring-1 ring-[color:var(--color-brand-100)] sm:p-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)]">
                Misi
              </h2>
              <ul className="mt-3 space-y-3 text-base leading-relaxed text-zinc-700">
                <li className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand-500)]" />
                  Menyediakan kursus berkualitas dengan harga sekali bayar,
                  akses seumur hidup.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand-500)]" />
                  Membuat progres belajar dapat dirasakan lewat sistem EXP,
                  level, dan sertifikat.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand-500)]" />
                  Menjembatani belajar dan dunia kerja lewat program magang
                  batch terstruktur.
                </li>
              </ul>
            </div>
          </div>
        </SiteContainer>
      </section>

      {/* Pillars */}
      <section className="py-16">
        <SiteContainer>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
              <span className="size-1 rounded-full bg-[color:var(--color-brand-accent)]" />
              Tiga pilar
            </span>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Kompas yang memandu tiap keputusan kami.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }, i) => (
              <article
                key={title}
                className="relative overflow-hidden rounded-3xl bg-white p-7 ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:ring-[color:var(--color-brand-300)]"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
                  <Icon className="size-6" />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <h3 className="font-heading text-lg font-bold text-zinc-900">
                    {title}
                  </h3>
                  <span className="font-mono text-[11px] font-semibold text-zinc-400">
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </SiteContainer>
      </section>

      {/* Team */}
      <section id="karir" className="py-16">
        <SiteContainer>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-50)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)]">
                <Users className="size-3" />
                Tim
              </span>
              <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Wajah-wajah di balik NextLevel.
              </h2>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--color-brand-800)] ring-1 ring-zinc-200 transition hover:bg-[color:var(--color-brand-50)]"
            >
              Bergabung dengan tim
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, idx) => (
              <div
                key={`${member.name}-${idx}`}
                className="relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-[color:var(--color-brand-accent)] font-heading text-base font-extrabold text-[color:var(--color-brand-900)]">
                  {member.initials}
                </div>
                <h3 className="mt-5 font-heading text-base font-bold text-zinc-900">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  {member.role}
                </p>
                <span className="absolute right-5 top-5 font-mono text-[11px] text-zinc-300">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      <div className="pb-16" />
    </>
  );
}
