"use client";

import { useEffect } from "react";

/**
 * Subtle parallax for the hero's decorative background layers. Targets every
 * `[data-parallax]` element inside the hero and nudges its `--parallax-y` CSS
 * var based on scroll position (transform-only — CSS consumes the var).
 *
 * Performance guards:
 * - passive scroll listener + requestAnimationFrame throttle (one write/frame).
 * - disabled on `prefers-reduced-motion` and on viewports < 768px (mobile).
 * - only updates while the hero is still in view (scrollY < hero height).
 */
export function HeroParallax() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (reduceMotion || !isDesktop) return;

    const layers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]"),
    );
    if (layers.length === 0) return;

    const hero = layers[0].closest("section");
    let ticking = false;

    const update = () => {
      ticking = false;
      const heroHeight = hero?.offsetHeight ?? window.innerHeight;
      const y = window.scrollY;
      if (y > heroHeight) return;
      for (const layer of layers) {
        const factor = Number(layer.dataset.parallax) || 0.12;
        layer.style.setProperty("--parallax-y", `${(y * factor).toFixed(1)}px`);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
