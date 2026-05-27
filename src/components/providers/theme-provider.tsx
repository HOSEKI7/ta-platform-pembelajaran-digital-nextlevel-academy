"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

type ThemeContextValue = {
  /** The user's preference, including "system". */
  theme: Theme;
  /** The concrete theme actually applied to <html> ("light" | "dark"). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

/**
 * Apply the resolved theme to <html>, briefly killing CSS transitions so the
 * whole page doesn't animate its colors on a theme swap. Mirrors next-themes'
 * `disableTransitionOnChange`.
 */
function applyResolvedTheme(resolved: ResolvedTheme) {
  const html = document.documentElement;

  const killTransitions = document.createElement("style");
  killTransitions.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none!important}",
    ),
  );
  document.head.appendChild(killTransitions);

  html.classList.toggle("dark", resolved === "dark");
  html.style.colorScheme = resolved;

  // Force a reflow so the "no transition" rule is flushed, then drop it.
  window.getComputedStyle(document.body);
  setTimeout(() => {
    document.head.removeChild(killTransitions);
  }, 1);
}

/**
 * Lightweight class-based theme provider replacing `next-themes`.
 *
 * next-themes renders its anti-FOUC `<script>` from a client component, which
 * trips a React 19.2 dev warning ("Encountered a script tag…") whenever React
 * *creates* (vs hydrates) that node on a Fast-Refresh remount. We instead emit
 * the init script server-side from the root layout (hydrated, never created on
 * the client) and keep only the React context here.
 *
 * The root layout's inline script sets the correct `dark` class before paint,
 * so the `useState`/`useEffect` hydration below never causes a flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // localStorage isn't readable during SSR — hydrate the real preference on
  // mount. The layout's inline script already applied the class, so no flash.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked (e.g. private mode) — fall back to "system".
    }
    const next = isTheme(stored) ? stored : "system";
    // Initial sync from an external system (localStorage) that's unreadable
    // during SSR — the sanctioned use of setState in an effect, same as
    // theme-toggle.tsx and use-mobile.ts. React batches both into one render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(next);
    setResolvedTheme(resolve(next));
  }, []);

  // Follow the OS preference while the user is on "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia(MEDIA_QUERY);
    const onChange = () => setResolvedTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  // Mirror the preference across tabs.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = isTheme(event.newValue) ? event.newValue : "system";
      setThemeState(next);
      setResolvedTheme(resolve(next));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Reflect the resolved theme onto <html> whenever it changes.
  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked — preference won't persist, but the swap still applies.
    }
    setThemeState(next);
    setResolvedTheme(resolve(next));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  // Match next-themes' lenient default so consumers (e.g. Toaster) never crash
  // when rendered outside the provider.
  return ctx ?? { theme: "system", resolvedTheme: "light", setTheme: () => {} };
}
