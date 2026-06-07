import { useCallback, useRef } from "react";

/**
 * Scroll-reveal hook powering the `<Reveal>` component. Follows the DOM-toggle
 * pattern of `nav-scroll-effect.tsx`: it mutates a `data-reveal` attribute (no
 * React state, so no re-render) while CSS in `globals.css` does the animating
 * (`.reveal-ready [data-reveal]` → `[data-reveal="in"]`, transform + opacity only).
 *
 * Returns a stable **callback ref** — attach it to the element you want to
 * reveal. On attach it registers with ONE shared IntersectionObserver (cheap for
 * many reveals); reveal is one-shot (unobserved after entering view, never
 * re-hidden on scroll up). Honors `prefers-reduced-motion` by leaving the
 * element visible (the `reveal-ready` gate is never added).
 */

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        observer?.unobserve(entry.target);
        callbacks.delete(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );
  return observer;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((node: T | null) => {
    // Detach from any previous node first.
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const obs = getObserver();
    if (reduceMotion || !obs) return; // leave the element visible, no animation

    // The hidden base state only applies once JS confirms it can animate, so
    // no-JS / unsupported browsers always render content (anti-FOUC).
    document.documentElement.classList.add("reveal-ready");

    const reveal = () => {
      node.style.willChange = "transform, opacity";
      node.dataset.reveal = "in";
      window.setTimeout(() => {
        node.style.willChange = "";
      }, 700);
    };

    callbacks.set(node, reveal);
    obs.observe(node);
    cleanupRef.current = () => {
      obs.unobserve(node);
      callbacks.delete(node);
    };
  }, []);
}
