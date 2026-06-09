# Auth Revisi — Pengecekan Eksplisit di Halaman Auth ✅

Plan: `C:\Users\HOSEKI\.claude\plans\security-review-konteks-next-js-app-rustling-hamster.md`
Keputusan: email literal (drop normalisasi) · tolak duplikat eksplisit tanpa Resend · change-email eksplisit · rate-limit Redis dipertahankan.

## A. Hapus infrastruktur normalisasi
- [x] DELETE `normalize-email.ts`, `existing-user-signup.tsx`, `change-email-confirmation.tsx`, `backfill-normalized-email.ts` + script package.json
- [x] schema: hapus kolom `normalizedEmail` + `@@index`

## B. auth.ts
- [x] hapus import normalize/email-templates (pertahankan authRateLimitStorage)
- [x] hapus additionalField + onExistingUserSignUp + databaseHooks.user.* + sendChangeEmailConfirmation
- [x] before-hook: cek duplikat eksplisit throw USER_ALREADY_EXISTS
- [x] pertahankan rateLimit.customStorage

## C. email-change route
- [x] revert: prisma + pre-check 409 + pesan asli; pertahankan rate-limit

## D. Revert salinan UI & pesan
- [x] register-form cabang USER_ALREADY_EXISTS · auth-error-messages 3 pesan · profile-form 2 salinan

## E. Pertahankan: auth-rate-limit-storage.ts, changeEmailRateLimiter, customStorage wiring ✅

## F. Docs
- [x] PRD §6.1.1/§6.1.4 revert; §11.3 pertahankan; CLAUDE.md Session History; todo

## Verifikasi
- [x] `prisma generate` + `tsc --noEmit` (lulus) + `lint` (0 error; warning `watch()` benign)
- [ ] **User: `npx prisma db push --accept-data-loss`** (DROP kolom `normalizedEmail`)
- [ ] Black-box matrix di dev server
