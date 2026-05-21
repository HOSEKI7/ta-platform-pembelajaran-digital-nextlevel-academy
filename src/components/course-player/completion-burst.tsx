"use client";

import { useState } from "react";

type Particle = {
  id: number;
  dx: number;
  dy: number;
  size: number;
  delay: number;
  color: string;
  shape: "dot" | "bar";
};

/** Generates a deterministic-ish particle field — random magnitudes within
 *  bounded ranges so the burst always reads "celebratory but not chaotic".  */
function makeParticles(): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
    const distance = 70 + Math.random() * 50;
    out.push({
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 5 + Math.round(Math.random() * 4),
      delay: Math.random() * 80,
      color:
        i % 3 === 0
          ? "var(--player-accent-yellow)"
          : "var(--player-accent)",
      shape: i % 4 === 0 ? "bar" : "dot",
    });
  }
  return out;
}

type Props = { show: boolean };

export function CompletionBurst({ show }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [prevShow, setPrevShow] = useState(false);

  // Regenerate the random particle field every time the burst turns on.
  // "Adjust state during render" pattern avoids an extra render cycle.
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) setParticles(makeParticles());
  }

  if (!show || particles.length === 0) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-0"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-0 top-0"
          style={{
            // CSS vars consumed by `@keyframes player-burst`.
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            width: p.shape === "bar" ? `${p.size * 1.8}px` : `${p.size}px`,
            height: p.shape === "bar" ? "2px" : `${p.size}px`,
            background: p.color,
            borderRadius: p.shape === "bar" ? "2px" : "9999px",
            boxShadow: `0 0 12px ${p.color}`,
            animation: `player-burst 950ms cubic-bezier(0.2, 0.7, 0.2, 1) ${p.delay}ms forwards`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </span>
  );
}
