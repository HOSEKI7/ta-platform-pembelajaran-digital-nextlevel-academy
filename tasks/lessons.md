# Pelajaran Sesi (Patterns to keep, mistakes to avoid)

## File storage vendor: Bunny, bukan Supabase

**Rule:** Untuk file blob yang di-upload user (submission tugas, lampiran mentor, dst.), **simpan fisik file di Bunny Storage**, bukan Supabase Storage. Postgres (Supabase) cuma menyimpan metadata/path; blob fisik di Bunny.

**Why:** Supabase Free plan hanya menyediakan 1 GB storage (500 MB DB, 5 GB egress/bulan). Submission tugas berakumulasi cepat. Bunny.net sudah jadi vendor blob di project (Bunny Stream untuk video — `src/lib/bunny.ts`), jadi menambah Bunny Storage konsisten + jauh lebih murah (~$0.01/GB/bulan).

**Anti-pattern yang harus dihindari:** Jangan otomatis mengusulkan Supabase Storage hanya karena Supabase sudah dipakai untuk Postgres. Selalu pisahkan: **data → Supabase Postgres; blob → Bunny Storage**. Avatar (existing, public, kecil) di Supabase = pengecualian yang sudah ada — jangan tambah pengecualian baru tanpa alasan kuat.
