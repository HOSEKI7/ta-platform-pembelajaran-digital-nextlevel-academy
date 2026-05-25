# TODO — Integrasi Halaman EXP & Level dengan Backend (PRD §6.7) ✅ SELESAI

Plan: `~/.claude/plans/integrasikan-halaman-exp-misty-tome.md`
Keputusan user: voucher pakai tombol **Klaim** (tulis ke DB), masa berlaku **180 hari**, badge **semua trigger**.

## A. Mesin gamifikasi (backend)
- [x] `src/lib/gamification-types.ts` — DTO + `badgeTitleForLevel` + `badgeVisual`
- [x] `src/lib/voucher-code.ts` — `generateVoucherCode(level)` (nanoid, `NLA-LV{n}-{8}`)
- [x] `src/lib/gamification.ts` — `awardExp`, `applyExpGain` (level-up + reset exp→0), `awardLevelBadges`, `awardCompletionBadges`, `claimRewardVoucher`, `reconcileLevelBadges`, loaders

## B. Wire ke route EXP
- [x] `complete/route.ts` — `awardExp` + `awardCompletionBadges`
- [x] `quiz/submit/route.ts` — `awardExp` + `awardCompletionBadges`

## C. Klaim voucher (API + hook)
- [x] `src/lib/validators/rewards.ts`
- [x] `POST /api/student/me/reward-vouchers/claim`
- [x] `src/hooks/use-claim-reward-voucher.ts`
- [~] `studentKeys.rewardVouchers()` — DILEWATI (view pakai local-state, key tak terpakai)

## D. Frontend
- [x] `exp-level/page.tsx` — load data nyata (`loadExpLevelPage`)
- [x] `exp-level-view.tsx` — claim mutation + toast, hapus localStorage
- [x] `reward-roadmap.tsx` — chip status + disable saat claiming
- [x] `badge-collection.tsx` — ganti import type (`level-hero-card.tsx` tidak perlu)
- [x] hapus `mock-data.ts`

## E. Seed + verifikasi
- [x] `prisma/seed.ts` — 7 badge
- [x] `npm run db:seed`
- [x] `npx tsc --noEmit` + `npm run lint` (bersih)
- [x] verifikasi engine via rolled-back tx (level-up + reset + badge + voucher) ✔
