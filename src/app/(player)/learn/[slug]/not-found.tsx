import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function LearnNotFound() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[color:var(--player-stage)] px-6 py-20">
      <div
        aria-hidden
        className="player-halo pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
      />
      <div className="relative mx-auto max-w-xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--player-hairline)] bg-[color:var(--player-surface)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          <Compass className="size-3.5" strokeWidth={2.4} />
          404 · Course Player
        </span>
        <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          Materi yang kamu cari belum tersedia di mode belajar.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">
          Slug kursus tidak cocok dengan data pelajar yang sedang berjalan.
          Mungkin URL-nya salah, atau kursus ini dihapus dari katalogmu.
        </p>
        <div className="mt-8 inline-flex items-center gap-2">
          <Link
            href="/my-courses"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[color:var(--player-accent)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(71,142,244,0.65)] transition hover:brightness-110"
          >
            <ArrowLeft className="size-4" strokeWidth={2.6} />
            Kembali ke Kursus Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
