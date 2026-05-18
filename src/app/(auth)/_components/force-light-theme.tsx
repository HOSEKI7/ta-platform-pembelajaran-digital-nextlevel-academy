"use client";

import { useEffect } from "react";

/**
 * Keeps the `dark` class off <html> for the entire lifetime of the auth
 * layout, then restores it on unmount.
 *
 * A one-shot effect isn't enough — the root next-themes <ThemeProvider>'s own
 * effect re-applies `dark` immediately after, losing the race. A
 * MutationObserver re-strips the class every time something re-adds it, so
 * auth pages stay light without overwriting the user's saved theme preference.
 */
export function ForceLightTheme() {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");

    const strip = () => {
      if (html.classList.contains("dark")) html.classList.remove("dark");
    };

    strip();

    const observer = new MutationObserver(strip);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      if (wasDark) html.classList.add("dark");
    };
  }, []);

  return null;
}
