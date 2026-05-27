"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Particle = {
  id: number;
  dx: number;
  dy: number;
  size: number;
  delay: number;
  color: string;
  shape: "dot" | "bar";
};

const CONFETTI_COLORS = [
  "var(--color-brand-accent)", // yellow
  "var(--color-brand-500)", // blue
  "#34d399", // emerald-400
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Bounded-random radial field — celebratory but never chaotic. Mirrors the
 *  course-player `completion-burst` approach. */
function makeParticles(): Particle[] {
  const out: Particle[] = [];
  const count = 22;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 90 + Math.random() * 80;
    out.push({
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 6 + Math.round(Math.random() * 5),
      delay: Math.random() * 90,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: i % 3 === 0 ? "bar" : "dot",
    });
  }
  return out;
}

type Props = { show: boolean };

/**
 * Festive, CSS-only success overlay shown when a task is submitted. Fixed,
 * full-screen, pointer-events-none — so it never blocks interaction and is
 * unmounted by the parent shortly after it plays. Honors reduced-motion by
 * dropping the confetti + ripple and keeping just the seal.
 */
export function SubmissionCelebration({ show }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [reduced, setReduced] = useState(false);
  const [prevShow, setPrevShow] = useState(false);

  // Regenerate the field each time the burst turns on (adjust-state-in-render).
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) {
      const r = prefersReducedMotion();
      setReduced(r);
      setParticles(r ? [] : makeParticles());
    }
  }

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] grid place-items-center"
    >
      <div className="relative grid place-items-center">
        {/* Ripple rings */}
        {!reduced ? (
          <>
            <span
              className="absolute size-28 rounded-full ring-2 ring-emerald-400/60"
              style={{ animation: "task-ring-ripple 900ms ease-out forwards" }}
            />
            <span
              className="absolute size-28 rounded-full ring-2 ring-[color:var(--color-brand-400)]/50"
              style={{ animation: "task-ring-ripple 1100ms ease-out 120ms forwards" }}
            />
          </>
        ) : null}

        {/* Confetti */}
        <span className="absolute left-1/2 top-1/2 size-0">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute left-0 top-0"
              style={{
                ["--dx" as string]: `${p.dx}px`,
                ["--dy" as string]: `${p.dy}px`,
                width: p.shape === "bar" ? `${p.size * 1.9}px` : `${p.size}px`,
                height: p.shape === "bar" ? "3px" : `${p.size}px`,
                background: p.color,
                borderRadius: p.shape === "bar" ? "2px" : "9999px",
                boxShadow: `0 0 12px ${p.color}`,
                animation: `player-burst 1000ms cubic-bezier(0.2, 0.7, 0.2, 1) ${p.delay}ms forwards`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </span>

        {/* Success seal */}
        <span
          className="relative grid size-24 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.7)] ring-4 ring-white dark:ring-[color:var(--color-surface-card)]"
          style={{
            animation: reduced
              ? "task-rise-fade 1500ms ease-out forwards"
              : "task-seal-pop 620ms cubic-bezier(0.22, 1.2, 0.36, 1) forwards",
          }}
        >
          <Check className="size-12" strokeWidth={3} />
        </span>

        {/* Label */}
        <span
          className="absolute -bottom-12 whitespace-nowrap rounded-full bg-zinc-900/90 px-4 py-1.5 text-sm font-bold text-white backdrop-blur dark:bg-white/95 dark:text-zinc-900"
          style={{ animation: "task-rise-fade 1600ms ease-out forwards" }}
        >
          Tugas Terkumpul! 🎉
        </span>
      </div>
    </div>
  );
}
