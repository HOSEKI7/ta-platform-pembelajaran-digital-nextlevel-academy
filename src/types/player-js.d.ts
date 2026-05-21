/**
 * Minimal type declarations for the `player.js` UMD package (no official types).
 * Only the surface we consume in `src/components/course-player/video-frame.tsx`
 * is modelled — extend as needed if other call sites grow.
 */
declare module "player.js" {
  type PlayerEventPayload = { seconds: number; duration: number };

  export class Player {
    constructor(iframe: HTMLIFrameElement);
    on(event: "ready", handler: () => void): void;
    on(event: "ended", handler: () => void): void;
    on(event: "play" | "pause", handler: () => void): void;
    on(event: "timeupdate", handler: (payload: PlayerEventPayload) => void): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string): void;
    getDuration(callback: (duration: number) => void): void;
    getCurrentTime(callback: (seconds: number) => void): void;
    play(): void;
    pause(): void;
  }

  const playerjs: { Player: typeof Player };
  export default playerjs;
}
