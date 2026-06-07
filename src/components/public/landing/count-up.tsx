"use client";

import { useEffect, useRef, useState } from "react";

const numId = new Intl.NumberFormat("id-ID");

type CountUpProps = {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
};

/**
 * Counts from 0 → `value` the first time it scrolls into view (one-shot, via
 * IntersectionObserver + requestAnimationFrame). Only the text node updates, so
 * it is cheap. Honors `prefers-reduced-motion` by rendering the final value
 * immediately.
 */
export function CountUp({ value, suffix, durationMs = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let rafId = 0;
    let started = false;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      // Jump straight to the final value on the next frame (no animation), which
      // also keeps setState out of the synchronous effect body.
      rafId = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(rafId);
    }

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(value * eased));
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            animate();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {numId.format(display)}
      {suffix ? <span className="text-[color:var(--color-brand-accent)]">{suffix}</span> : null}
    </span>
  );
}
