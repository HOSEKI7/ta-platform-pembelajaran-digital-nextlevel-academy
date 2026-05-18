"use client";

import { useEffect } from "react";

/**
 * Tiny effect: toggles a `data-scrolled` attribute on the nearest
 * `[data-nav-root]` ancestor when window.scrollY > 8. CSS handles the rest
 * (translucent → white-with-shadow). Keeps the navbar markup server-rendered.
 */
export function NavScrollEffect() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-nav-root]");
    if (!root) return;

    const handle = () => {
      root.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return null;
}
