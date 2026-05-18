/**
 * Gamification math for the EXP / level system (PRD §6.7.2).
 *
 *   REQ(L) = 744 + 124 × (L − 1)
 *
 * `exp` on UserGameProfile is the EXP accumulated WITHIN the current level
 * and resets to 0 on level-up. `totalExp` is the cumulative never-reset
 * counter used for badges and history charts.
 *
 * These functions are pure, client + server safe, and intentionally don't
 * import prisma or any runtime-bound modules.
 */

export function expRequiredForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return 744 + 124 * (safeLevel - 1);
}

export type ExpProgress = {
  current: number;
  required: number;
  pct: number;
};

export function expProgress(input: { level: number; exp: number }): ExpProgress {
  const required = expRequiredForNextLevel(input.level);
  const current = Math.max(0, Math.floor(input.exp));
  const pct = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 0;
  return { current, required, pct };
}

const idFmt = new Intl.NumberFormat("id-ID");

export function formatExp(n: number): string {
  return idFmt.format(Math.max(0, Math.floor(n)));
}
