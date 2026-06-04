# Task: Gender opsional untuk Mentor + sapaan Pak/Bu di dashboard

Keputusan user: simpan di `MentorProfile` · radio di form Tambah + Edit · opsi Laki-laki/Perempuan (boleh kosong).

## Langkah

- [x] 1. Schema: `enum Gender { MALE FEMALE }` + `gender Gender?` di `MentorProfile` (`prisma/schema.prisma`)
- [x] 2. Validasi: tambah `gender` (z.enum string, optional) ke `createUserSchema` & `editUserSchema` (`validations/admin-user.ts`)
- [x] 3. Write helper: `gender` di `CreateManagedUserInput` + `mentorProfile.create` (`admin-user-write.ts`)
- [x] 4. API create: teruskan `gender` ke `createManagedUser` (`api/admin/users/route.ts`)
- [x] 5. API edit: set `gender` di `mentorProfile.upsert` create+update (`api/admin/users/[userId]/route.ts`)
- [x] 6. Edit loader: select + return `gender` dari `mentorProfile` (`admin-users-loader.ts`)
- [x] 7. Komponen radio gender bersama (`admin/users/form/gender-radio.tsx`)
- [x] 8. Form Tambah: radio gender saat role MENTOR (`create-user-view.tsx`)
- [x] 9. Form Edit: radio gender saat role MENTOR (`edit-user-view.tsx`)
- [x] 10. Loader dashboard: baca `gender`, hitung `honorific` Pak/Bu -> `MentorDashboardData` (`mentor-data-loader.ts` + `mentor-types.ts`)
- [x] 11. Dashboard page + MentorDashboard + MentorHero: render sapaan (`page.tsx`, `mentor-dashboard.tsx`, `mentor-hero.tsx`)
- [x] 12. Verifikasi: `npx tsc --noEmit` + reminder `prisma generate && db push`

## Catatan
- Sapaan hanya tampil bila gender terisi ("jika telah dipilih").
- `prisma generate && db push` diperlukan setelah ubah schema (ingatkan user).
