# TODO — Halaman Detail Transaksi `/transactions/[id]` (frontend + backend)

## Konteks
Lanjutan halaman Transaksi. Tombol "Detail Transaksi" di tabel kini hanya toast
placeholder. Buat halaman detail penuh **menarik & informatif**, terintegrasi
backend, **konsisten** dengan design system dashboard (rounded-3xl, ring zinc,
brand blue, font-heading) — bukan estetika menyimpang.

> STATUS: ✅ SELESAI. Keputusan CTA user: PENDING → tombol "Lanjutkan Pembayaran"
> placeholder (gateway belum ada) + countdown; SUCCESS → tombol "Unduh Bukti
> Transaksi" (PDF receipt); FAILED → tanpa tombol; EXPIRED → tanpa tombol (asumsi,
> konsisten dengan FAILED). Visual: konsisten design system dashboard.

## A. Backend
- [x] `transaction-data-loader.ts` — `loadTransactionDetail(userId, orderId)`:
      `order.findFirst({ where: { id, userId } })` (scope userId = keamanan → null
      jika bukan miliknya). Include `course` (title/slug/thumbnailUrl/instructor/
      category.name) + `voucher` (code/discountPct). Return `TransactionDetailDTO | null`.
- [ ] DTO `TransactionDetailDTO`: id, status, course{...}, pricing{originalPrice,
      discountAmount, finalPrice}, voucher{code,discountPct}|null, paymentMethod,
      paymentInvoiceId, checkoutAt, paidAt, expiresAt (ISO).

## B. Page (Server Component, direct fetch — no TanStack)
- [ ] `src/app/(student)/transactions/[id]/page.tsx`: `params: Promise<{id}>`,
      `requireRole(PESERTA_DIDIK)`, `await params`, loader → `notFound()` jika null,
      `generateMetadata` noindex, wrapper `max-w-5xl`.

## C. View
- [ ] `transaction-detail-view.tsx` (Server Component): back link, hero card
      (status badge + ID mono + salin + judul + waktu checkout), Rincian Pembayaran
      (Harga Asli → Diskon −/chip voucher → Total ditebalkan), grid metadata (metode,
      invoice id+salin, tgl checkout, tgl dibayar, batas waktu), kartu kursus
      (thumbnail+instruktur+kategori), CTA sadar-status, animasi masuk staggered.
- [ ] `CopyButton` (client) salin id/invoice → toast.
- [ ] (Opsional) `PendingCountdown` (client) untuk status PENDING.

## D. Sambung tabel
- [ ] `transactions-view.tsx` `DetailButton`: `onClick/toast` → `<Link href="/transactions/${id}">`.

## E. Verifikasi
- [ ] `tsc --noEmit` + `eslint` bersih.
- [ ] throwaway: `loadTransactionDetail` order nyata → DTO benar; id asing → null.
- [ ] browser: klik detail dari tabel, cek SUCCESS/FAILED nyata, salin, back, 404, mobile.
- [ ] `init` (catat CLAUDE.md).

## Keputusan check-in (CTA sadar-status)
Menunggu konfirmasi user — lihat pertanyaan.
