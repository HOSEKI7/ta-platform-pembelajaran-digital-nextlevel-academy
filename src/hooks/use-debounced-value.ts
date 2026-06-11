"use client";

import { useEffect, useState } from "react";

/**
 * Shared debounce delay (ms) for every search-filter input across the app.
 * Single source of truth — bump here, not per-view.
 */
export const SEARCH_DEBOUNCE_MS = 500;

/**
 * Returns `value` delayed by `delayMs`: it only settles to the latest value
 * once the caller stops changing it for `delayMs`. Typing into a search box
 * stays instant (the raw state drives the input); only the *debounced* value
 * is what we commit to the URL / fire a refetch with.
 *
 * `setDebounced` runs inside the timeout (async), so this is safe under the
 * React Compiler `react-hooks/set-state-in-effect` lint.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
