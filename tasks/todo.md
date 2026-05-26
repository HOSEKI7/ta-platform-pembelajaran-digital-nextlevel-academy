# Task: Sistem Checkout & Pembayaran Midtrans (PRD §6.4) — SELESAI ✅

## Schema & Env
- [x] `prisma/schema.prisma` — Order: add `paymentToken`, `paymentRedirectUrl`
- [x] `.env.local` + `.env.example` — add `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `CRON_SECRET` (DOKU block dihapus)
- [x] `src/lib/env.ts` — add `midtrans` group + `cronSecret()`

## Core libs
- [x] `src/types/midtrans-client.d.ts` — ambient types (paket tak punya types)
- [x] `src/lib/midtrans.ts` — Snap client, createSnapTransaction, verifySignature (SHA512), mappers
- [x] `src/lib/payment/fulfillment.ts` — `fulfillOrderPaid` (idempotent, enroll + email)
- [x] `src/lib/payment-instructions.ts` — "cara membayar" per group
- [x] `src/lib/validators/payment.ts` — `midtransWebhookSchema`
- [x] `src/lib/payment-data-loader.ts` — `loadPaymentPageData` (+ isExpired)
- [x] `src/lib/invoice-number.ts` — `generateInvoiceNumber` (INV-YYYYMMDD-XXXXXXXX, WIB)
- [x] `src/emails/order-confirmation.tsx`

## API routes
- [x] `src/app/api/orders/route.ts` — Snap + dev fallback + free course
- [x] `src/app/api/payment/webhook/route.ts` — signature + amount + idempotency + fulfill
- [x] `src/app/api/payment/orders/[id]/status/route.ts` — polling
- [x] `src/app/api/payment/dev-simulate/route.ts` — dev-only simulate
- [x] `src/app/api/cron/expire-orders/route.ts` — CRON_SECRET

## Payment page
- [x] `src/app/(checkout)/payment/[orderId]/page.tsx`
- [x] `src/components/checkout/payment/payment-view.tsx`
- [x] `src/hooks/use-midtrans-snap.ts`
- [x] `src/hooks/use-order-status.ts`

## Wiring & cleanup
- [x] `src/hooks/use-checkout.ts` — extend CreatedOrder + CreateOrderError (resume)
- [x] `src/app/(checkout)/checkout/[slug]/checkout-form.tsx` — redirect to /payment
- [x] `src/components/dashboard/transactions/transaction-detail-actions.tsx` — Link
- [x] `src/components/dashboard/transactions/transaction-detail-view.tsx` — pass orderId
- [x] `src/proxy.ts` — add `/payment`
- [x] DOKU→Midtrans text: `(checkout)/layout.tsx`, `payment-methods.ts`
- [x] `vercel.json` — cron */5 (optional deploy)

## Verify
- [x] `npx tsc --noEmit` (clean)
- [x] `npx eslint` changed files (clean)
- [x] `prisma generate` + `prisma db push` (in sync)
- [x] `npm run build` (all routes compiled, client/server boundaries valid)
- [ ] dev-fallback flow end-to-end (manual, browser — login PESERTA_DIDIK)
