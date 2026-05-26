"use client";

import { useCallback, useEffect, useState } from "react";

/** Result object Snap passes to its callbacks. Loosely typed — we only read a few fields. */
export type SnapResult = {
  order_id?: string;
  transaction_status?: string;
  status_code?: string;
  [key: string]: unknown;
};

export type SnapCallbacks = {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
};

type SnapGlobal = {
  pay: (token: string, callbacks?: SnapCallbacks) => void;
};

declare global {
  interface Window {
    snap?: SnapGlobal;
  }
}

const SCRIPT_ID = "midtrans-snap-script";

/**
 * Loads Midtrans `snap.js` once (sandbox vs production decided server-side) and
 * exposes a typed `pay()`. The client key is public-safe.
 */
export function useMidtransSnap(opts: { clientKey: string; isProduction: boolean }) {
  const { clientKey, isProduction } = opts;
  // Lazy init: if snap.js is already on the page (e.g. client-side nav back), we
  // start ready. On a fresh load `window.snap` is absent, so this matches SSR.
  const [isReady, setIsReady] = useState<boolean>(
    () => typeof window !== "undefined" && Boolean(window.snap),
  );

  useEffect(() => {
    if (!clientKey || window.snap) return;

    // setIsReady is only ever called from the script's load event — an external
    // system callback, not a synchronous effect-body update.
    const onLoad = () => setIsReady(true);

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.addEventListener("load", onLoad);
    document.body.appendChild(script);
    return () => script.removeEventListener("load", onLoad);
  }, [clientKey, isProduction]);

  const pay = useCallback((token: string, callbacks?: SnapCallbacks) => {
    if (!window.snap) {
      console.error("[snap] snap.js not loaded yet");
      return;
    }
    window.snap.pay(token, callbacks);
  }, []);

  return { isReady, pay };
}
