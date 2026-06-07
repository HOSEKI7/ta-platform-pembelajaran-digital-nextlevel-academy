"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal engine for the landing page. Mirrors `nav-scroll-effect.tsx`:
 * a tiny client component that toggles `data-*` attributes while CSS does the
 * actual animating. Markup stays server-rendered.
 *
 * - Adds `reveal-ready` to <html> so the hidden base state only applies once JS
 *   is alive (no-JS / unsupported browsers always see content).
 * - A single IntersectionObserver flips `[data-reveal]` → `[data-reveal="in"]`
 *   the first time each element enters the viewport (one-shot), then releases
 *   `will-change` and stops observing it.
 * - Honors `prefers-reduced-motion`: bail out entirely so content shows fully.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") return;

    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (targets.length === 0) {
      root.classList.remove("reveal-ready");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.willChange = "transform, opacity";
          el.dataset.reveal = "in";
          observer.unobserve(el);
          // Drop will-change once the transition has settled.
          window.setTimeout(() => {
            el.style.willChange = "";
          }, 700);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    for (const el of targets) observer.observe(el);

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
