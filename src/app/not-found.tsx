import Link from "next/link";
import { ArrowLeft, ArrowRight, SearchX } from "lucide-react";

import { SiteContainer } from "@/components/public/site-container";

export default function GlobalNotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <section className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 85% 10%, rgba(71,142,244,0.20) 0%, transparent 42%)," +
              "radial-gradient(circle at 10% 90%, rgba(244,214,0,0.14) 0%, transparent 38%)," +
              "linear-gradient(180deg, rgba(238,245,255,0.7) 0%, rgba(255,255,255,1) 65%)",
          }}
        />

        <SiteContainer className="grid flex-1 place-items-center py-24">
          <div className="max-w-2xl text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-white text-[color:var(--color-brand-700)] shadow-[0_30px_60px_-30px_rgba(35,65,137,0.45)] ring-1 ring-zinc-200">
              <SearchX className="size-10" strokeWidth={1.8} />
            </div>

            <h1 className="mt-8 font-heading text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Halaman{" "}
              <span className="bg-gradient-to-br from-[color:var(--color-brand-700)] to-[color:var(--color-brand-500)] bg-clip-text text-transparent">
                tidak ditemukan.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-600">
              Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau kamu salah mengetik alamatnya.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-500)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-brand-600)]"
              >
                <ArrowLeft className="size-4" />
                Kembali ke Beranda
              </Link>
              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-[color:var(--color-brand-300)] hover:text-[color:var(--color-brand-700)]"
              >
                Lihat Kursus
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </SiteContainer>
      </section>
    </main>
  );
}
