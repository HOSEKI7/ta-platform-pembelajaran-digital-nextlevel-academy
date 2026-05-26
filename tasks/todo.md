# Task: Revisi Metode Pembayaran + Hardening Double-PENDING — SELESAI ✅

## Bagian 1 — Metode pembayaran
- [x] `src/lib/payment-methods.ts` — grup `qris|va|store|cardless`; daftar metode final (QRIS · 10 VA · Indomaret/Alfamart · Akulaku); hapus e-wallet
- [x] `src/lib/midtrans.ts` — `SNAP_PAYMENT_MAP` (BSI/SeaBank/Danamon/Saqu → `other_va`; akulaku; cimb/permata)
- [x] `src/lib/payment-instructions.ts` — `ewallet`→`cardless` (Akulaku)
- [x] `src/components/checkout/payment-method-card.tsx` — icon CreditCard, single-row digeneralisasi, teks DOKU→Midtrans

## Bagian 2 — Hardening double-PENDING
- [x] `src/app/api/orders/route.ts` — advisory lock (`$executeRaw`, bukan `$queryRaw`!) + re-cek dalam tx + `conflictResponse` 409
- [x] Diputuskan: advisory lock, BUKAN partial unique index (tak cocok dengan `prisma db push`)

## Verify
- [x] `npx tsc --noEmit` (clean)
- [x] `npx eslint` changed files (clean)
- [x] `npm run build` (compiled successfully)
- [x] throwaway: SQL lock jalan di DB live (`$executeRaw` OK; `$queryRaw` → P2010 UnsupportedNativeDataType)
- [ ] browser (sandbox keys): tampilan metode + alur Snap per metode (manual)
- [ ] double-PENDING: 2 curl paralel (manual)

## Heads-up untuk user
- Kunci Midtrans saat ini berformat PRODUKSI (tanpa SB-) → ganti ke Sandbox sebelum tes (isProduction=false).
- Aktifkan channel (akulaku/cimb_va/other_va/cstore) di dashboard Midtrans (MAP) agar muncul di Snap.
- BSI/SeaBank/Danamon/Saqu tampil sbg "Other VA" di popup Snap (label bank tetap tersimpan di order).
