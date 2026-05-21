"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Hourglass, RotateCcw, XCircle, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

type CommonProps = {
  passingScore: number;
};

type PassedProps = CommonProps & {
  variant: "passed";
  score: number;
  expAwarded: number;
  isLast: boolean;
  onRetry: () => void;
  onNext: () => void;
};

type FailedProps = CommonProps & {
  variant: "failed";
  score: number;
  attemptsLeft: number;
  onRetry: () => void;
};

type CooldownProps = CommonProps & {
  variant: "cooldown";
  cooldownUntil: string;
};

type Props = PassedProps | FailedProps | CooldownProps;

export function QuizResult(props: Props) {
  if (props.variant === "passed") return <PassedView {...props} />;
  if (props.variant === "failed") return <FailedView {...props} />;
  return <CooldownView {...props} />;
}

// -----------------------------------------------------------------------------

function PassedView({
  score,
  expAwarded,
  passingScore,
  isLast,
  onRetry,
  onNext,
}: PassedProps) {
  return (
    <ResultShell tone="success">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
        <CheckCircle2 className="size-8 text-emerald-300" strokeWidth={2.4} />
      </span>

      <div className="space-y-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">
          Lulus
        </p>
        <h3 className="text-2xl font-semibold text-white sm:text-[26px]">
          Selamat, kamu lulus kuis!
        </h3>
        <p className="text-sm text-white/65">
          Skor lulus minimum {passingScore}/100.
        </p>
      </div>

      <ScoreBadge score={score} tone="success" />

      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] ring-1",
          expAwarded > 0
            ? "bg-amber-500/10 text-amber-200 ring-amber-500/30"
            : "bg-white/[0.04] text-white/65 ring-white/10",
        )}
      >
        <Zap className="size-3.5" strokeWidth={2.6} />
        {expAwarded > 0
          ? `+${expAwarded} XP terklaim`
          : "EXP sudah pernah diklaim — tidak ditambah ulang"}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.04] px-4 text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <RotateCcw className="size-4" strokeWidth={2.4} />
          Coba Lagi
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[color:var(--player-accent)] to-[color:var(--player-accent-yellow)]/85 px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(71,142,244,0.7)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]"
          >
            Materi Selanjutnya
            <ArrowRight className="size-4" strokeWidth={2.6} />
          </button>
        ) : null}
      </div>
    </ResultShell>
  );
}

// -----------------------------------------------------------------------------

function FailedView({ score, passingScore, attemptsLeft, onRetry }: FailedProps) {
  const exhausted = attemptsLeft === 0;
  return (
    <ResultShell tone="warn">
      <span className="flex size-16 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/40">
        <XCircle className="size-8 text-amber-300" strokeWidth={2.4} />
      </span>

      <div className="space-y-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
          Belum Lulus
        </p>
        <h3 className="text-2xl font-semibold text-white sm:text-[26px]">
          Coba lagi, kamu pasti bisa
        </h3>
        <p className="text-sm text-white/65">
          Skor minimum untuk lulus: {passingScore}/100.
        </p>
      </div>

      <ScoreBadge score={score} tone="warn" />

      {exhausted ? (
        <div className="inline-flex max-w-md flex-col items-center gap-1 rounded-2xl bg-amber-500/8 px-4 py-3 text-center text-[12px] text-amber-200/90 ring-1 ring-amber-500/30">
          <span className="font-semibold">Percobaan habis</span>
          <span className="text-amber-200/70">
            Cooldown 30 menit dimulai. Belajar lagi materinya, lalu coba kembali nanti.
          </span>
        </div>
      ) : (
        <p className="text-xs text-white/55">
          Sisa percobaan dalam sesi ini:{" "}
          <span className="font-semibold text-white">{attemptsLeft}</span>
        </p>
      )}

      <button
        type="button"
        onClick={onRetry}
        disabled={exhausted}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition",
          exhausted
            ? "cursor-not-allowed bg-white/[0.05] text-white/40 ring-1 ring-white/10"
            : "bg-[color:var(--player-accent)] text-white shadow-[0_18px_40px_-18px_rgba(71,142,244,0.65)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]",
        )}
      >
        <RotateCcw className="size-4" strokeWidth={2.4} />
        Coba Lagi
      </button>
    </ResultShell>
  );
}

// -----------------------------------------------------------------------------

function CooldownView({ cooldownUntil, passingScore }: CooldownProps) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const target = new Date(cooldownUntil).getTime();
  const remainingMs = Math.max(0, target - now);
  const expired = remainingMs === 0;

  // When the cooldown elapses, pull fresh server state so the UI returns to
  // the intro screen. `router.refresh()` re-runs the Server Component loader.
  useEffect(() => {
    if (expired) router.refresh();
  }, [expired, router]);

  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const display = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  return (
    <ResultShell tone="warn">
      <span className="flex size-16 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/40">
        <Hourglass className="size-8 text-amber-300" strokeWidth={2.4} />
      </span>

      <div className="space-y-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-300/80">
          Cooldown Aktif
        </p>
        <h3 className="text-2xl font-semibold text-white sm:text-[26px]">
          Tunggu sebentar sebelum mencoba lagi
        </h3>
        <p className="max-w-md text-sm text-white/65">
          Kamu sudah memakai 3 percobaan dalam sesi ini. Gunakan waktu cooldown
          untuk meninjau materi. Skor lulus minimum tetap {passingScore}/100.
        </p>
      </div>

      <div className="font-mono text-5xl font-semibold tabular-nums text-white sm:text-6xl">
        {display}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
        Otomatis siap kembali saat hitungan habis
      </p>
    </ResultShell>
  );
}

// -----------------------------------------------------------------------------

function ResultShell({
  tone,
  children,
}: {
  tone: "success" | "warn";
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6 py-10 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,214,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,214,0,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-[20%] top-[18%] -z-0 h-32 rounded-full blur-3xl",
          tone === "success" ? "bg-emerald-500/15" : "bg-amber-500/15",
        )}
      />
      <div className="relative flex flex-col items-center gap-5">{children}</div>
    </div>
  );
}

function ScoreBadge({ score, tone }: { score: number; tone: "success" | "warn" }) {
  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-2 rounded-2xl px-5 py-3 ring-1",
        tone === "success"
          ? "bg-emerald-500/10 ring-emerald-500/30"
          : "bg-amber-500/10 ring-amber-500/30",
      )}
    >
      <span
        className={cn(
          "font-mono text-5xl font-semibold tabular-nums",
          tone === "success" ? "text-emerald-200" : "text-amber-200",
        )}
      >
        {score}
      </span>
      <span className="text-sm text-white/55">/100</span>
    </div>
  );
}
