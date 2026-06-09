# Auth Revisi — Pengecekan Eksplisit di Halaman Auth

Plan: `C:\Users\HOSEKI\.claude\plans\security-review-konteks-next-js-app-rustling-hamster.md`
Keputusan: email literal (drop normalisasi) · tolak duplikat eksplisit tanpa Resend · change-email eksplisit · rate-limit Redis dipertahankan.

## A. Hapus infrastruktur normalisasi
- [ ] DELETE `src/lib/normalize-email.ts`
- [ ] DELETE `src/emails/existing-user-signup.tsx`, `src/emails/change-email-confirmation.tsx`
- [ ] DELETE `scripts/backfill-normalized-email.ts` + script `package.json`
- [ ] schema: hapus kolom `normalizedEmail` + `@@index`

## B. auth.ts
- [ ] hapus import normalize/email-templates (pertahankan authRateLimitStorage)
- [ ] hapus additionalField normalizedEmail
- [ ] hapus onExistingUserSignUp
- [ ] revert changeEmail → `{ enabled: true }`
- [ ] hapus databaseHooks.user.* (sisakan session)
- [ ] before-hook: hapus rewrite, tambah cek duplikat eksplisit throw USER_ALREADY_EXISTS
- [ ] pertahankan rateLimit.customStorage

## C. email-change route
- [ ] hapus normalizeEmail, kembalikan prisma + pre-check 409 + pesan asli, pertahankan rate-limit

## D. Revert salinan UI & pesan
- [ ] register-form: cabang USER_ALREADY_EXISTS eksplisit
- [ ] auth-error-messages: kembalikan 3 pesan
- [ ] profile-form: 2 salinan "email baru"

## E. Pertahankan: auth-rate-limit-storage.ts, changeEmailRateLimiter, customStorage wiring

## F. Docs
- [ ] PRD §6.1.1/§6.1.4 revert; §11.3 pertahankan
- [ ] CLAUDE.md Session History tulis ulang
- [ ] tasks/todo.md (ini)

## Verifikasi
- [ ] `prisma generate` + `tsc --noEmit` + `lint`
- [ ] User: `prisma db push --accept-data-loss` (drop kolom)
- [ ] Black-box matrix
