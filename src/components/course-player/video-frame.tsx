"use client";

import { useEffect, useRef } from "react";

import type { Player as PlayerJsPlayer } from "player.js";

/**
 * Embeds Bunny Stream's iframe player and listens for "video finished"
 * signals via the Player.js postMessage protocol that Bunny implements.
 *
 * Two trigger paths fire `onEnded()` (whichever wins first):
 *   1. The `ended` event from the embed.
 *   2. A `timeupdate` listener that detects `currentTime >= duration - 1`,
 *      as a safety net for embeds that don't reliably emit `ended` (e.g.
 *      when the user seeks to the very end without crossing the boundary).
 *
 * A `firedRef` ensures `onEnded` is called at most once per step.
 *
 * `player.js` is a UMD package — we load it dynamically inside the effect
 * so its top-level `window.postMessage` reference never runs at SSR time,
 * and its bundle stays out of the initial JS payload.
 */

type Props = {
  embedUrl: string;
  stepId: string;
  isCompleted: boolean;
  onEnded: () => void;
};

export function VideoFrame({ embedUrl, stepId, isCompleted, onEnded }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const firedRef = useRef(false);
  const isCompletedRef = useRef(isCompleted);
  const onEndedRef = useRef(onEnded);

  // Keep refs in sync so the event listener always sees the latest state
  // without re-binding (which would tear down + recreate the postMessage
  // bridge to the iframe every render).
  useEffect(() => {
    isCompletedRef.current = isCompleted;
    onEndedRef.current = onEnded;
  }, [isCompleted, onEnded]);

  // Reset the "ended-fired" flag whenever the user navigates to a new step.
  useEffect(() => {
    firedRef.current = false;
  }, [stepId]);

  useEffect(() => {
    let cancelled = false;
    let instance: PlayerJsPlayer | null = null;

    (async () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      let PlayerCtor: typeof PlayerJsPlayer;
      try {
        // UMD package: `module.exports = playerjs`, so the dynamic import
        // resolves to `{ default: { Player } }`.
        const mod = await import("player.js");
        PlayerCtor = mod.default.Player;
      } catch (err) {
        console.error("[VideoFrame] Failed to load player.js", err);
        return;
      }
      if (cancelled) return;

      instance = new PlayerCtor(iframe);

      const handleComplete = () => {
        if (firedRef.current || isCompletedRef.current) return;
        firedRef.current = true;
        onEndedRef.current();
      };

      instance.on("ready", () => {
        // The "ready" message can arrive AFTER this effect was cleaned up
        // (step navigation / unmount). Attaching listeners then posts a message
        // to an iframe whose contentWindow is already null → crash. Bail out if
        // we've been torn down, and guard the postMessage path defensively.
        if (cancelled) return;
        try {
          instance!.on("ended", handleComplete);
          // Fallback path: check time/duration on every update. Bunny emits
          // timeupdate roughly 4x/second; the comparison is cheap.
          instance!.on("timeupdate", ({ seconds, duration }) => {
            if (firedRef.current || isCompletedRef.current) return;
            if (duration > 0 && seconds >= duration - 1) {
              handleComplete();
            }
          });
        } catch (err) {
          // iframe detached / reloading mid-handshake — nothing to bind to.
          console.warn("[VideoFrame] Failed to attach player listeners", err);
        }
      });
    })();

    return () => {
      cancelled = true;
      try {
        instance?.off?.("ended");
        instance?.off?.("timeupdate");
      } catch {
        // best-effort cleanup
      }
    };
  }, [embedUrl, stepId]);

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title="Pemutar video kursus"
      loading="lazy"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 h-full w-full border-0"
    />
  );
}
