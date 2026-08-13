"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, RotateCw } from "lucide-react";

import { SiteContainer } from "@/components/public/site-container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <section className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 85% 10%, rgba(220,38,38,0.15) 0%, transparent 42%)," +
              "radial-gradient(circle at 10% 90%, rgba(244,214,0,0.14) 0%, transparent 38%)," +
              "linear-gradient(180deg, rgba(254,242,242,0.5) 0%, rgba(255,255,255,1) 65%)",
          }}
        />

        <SiteContainer className="grid flex-1 place-items-center py-24">
          <div className="max-w-2xl text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-white text-red-600 shadow-[0_30px_60px_-30px_rgba(220,38,38,0.3)] ring-1 ring-zinc-200">
              <AlertTriangle className="size-10" strokeWidth={1.8} />
            </div>

            <h1 className="mt-8 font-heading text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Terjadi{" "}
              <span className="bg-gradient-to-br from-red-600 to-red-400 bg-clip-text text-transparent">
                kesalahan.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-600">
              Maaf, ada masalah saat memuat halaman ini. Silakan coba muat ulang atau kembali ke beranda.
            </p>

            {process.env.NODE_ENV !== "production" && (
              <div className="mx-auto mt-6 max-w-lg rounded-xl bg-red-50 p-4 text-left text-sm text-red-800 ring-1 ring-red-200/50">
                <p className="font-mono">{error.message || "Unknown error"}</p>
              </div>
            )}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => reset()}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(220,38,38,0.5)] transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                <RotateCw className="size-4 transition group-hover:rotate-180" />
                Coba lagi
              </button>
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-red-300 hover:text-red-600"
              >
                Beranda
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </SiteContainer>
      </section>
    </main>
  );
}
