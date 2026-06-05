# Pelajaran Sesi (Patterns to keep, mistakes to avoid)

## File storage vendor: Bunny, bukan Supabase

**Rule:** Untuk file blob yang di-upload user (submission tugas, lampiran mentor, dst.), **simpan fisik file di Bunny Storage**, bukan Supabase Storage. Postgres (Supabase) cuma menyimpan metadata/path; blob fisik di Bunny.

**Why:** Supabase Free plan hanya menyediakan 1 GB storage (500 MB DB, 5 GB egress/bulan). Submission tugas berakumulasi cepat. Bunny.net sudah jadi vendor blob di project (Bunny Stream untuk video — `src/lib/bunny.ts`), jadi menambah Bunny Storage konsisten + jauh lebih murah (~$0.01/GB/bulan).

**Anti-pattern yang harus dihindari:** Jangan otomatis mengusulkan Supabase Storage hanya karena Supabase sudah dipakai untuk Postgres. Selalu pisahkan: **data → Supabase Postgres; blob → Bunny Storage**. Avatar (existing, public, kecil) di Supabase = pengecualian yang sudah ada — jangan tambah pengecualian baru tanpa alasan kuat.

## TanStack Query key untuk halaman: taruh di modul netral, bukan file `"use client"`

**Rule:** Konstanta `queryKey` yang dipakai oleh **Server Component** (untuk `prefetchQuery`) **dan** hook klien **wajib** didefinisikan di modul tanpa direktif (`src/lib/*-query.ts`) — **bukan** diekspor dari file hook ber-`"use client"`.

**Why:** Saat Server Component meng-import sebuah *value* dari modul `"use client"`, bundler RSC mengganti modul itu dengan **client-reference proxy**, jadi nilainya bukan array asli → TanStack melempar `"queryKey needs to be an Array"`. Terjadi pada `/admin/admins` (key diekspor dari `use-admin-accounts.ts`). Fix: pindah ke `src/lib/admin-accounts-query.ts` (pola yang sudah benar di `admin-users-query.ts`/`admin-categories-query.ts`).

**Anti-pattern:** `export const fooKey` di file hook `"use client"`, lalu `import { fooKey }` dari `page.tsx` (server). Lebih umum: jangan pernah meng-import nilai non-komponen dari modul `"use client"` ke Server Component dan berharap dapat nilai runtime aslinya.
