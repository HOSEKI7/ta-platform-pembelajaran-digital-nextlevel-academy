<div align="center">
  <img src="/assets/LogoFit.png" height="85" alt="Deskripsi Gambar">
  <br>
  <br>
</div> 

NextLevel Academy adalah platform edukasi digital yang menyediakan kursus online, pelatihan, mentoring, seminar, dan workshop di berbagai bidang seperti multimedia, AI, programming, digital creative.

## Skripsi

Repositori dan source code ini bertujuan sebagai identifikasi progres pengembangan platform untuk keperluan Skripsi atau Tugas Akhir berjudul: "PENGEMBANGAN PLATFORM PEMBELAJARAN DIGITAL BERBASIS WEB DENGAN GAMIFIKASI DAN SISTEM MAGANG TERINTEGARASI (STUDI KASUS: NEXTLEVEL ACADEMY)".

### Tech Stack

- **Next.js 16** App Router with **Turbopack** + **React 19** + **TypeScript 5**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Prisma 7**
- **Better Auth**
- **TanStack Query**
- **Resend + React Email**
- **Bunny.net**
- **Midtrans**
- **Supabase**
- **Zod** validation, **react-hook-form** + `@hookform/resolvers`, **@react-pdf/renderer** for certificates, **Tiptap** for rich-text course descriptions, **Recharts** for admin analytics

### Website Preview

#### Landing Page
![Landing Page](/assets/LandingPage.png)

#### Auth Page
![Login Page](/assets/LoginPage.png)

#### Student Dashboard
![Dashboard Page (Peserta Didik)](/assets/Dashboard_PesertaDidik.png)

#### Video Course Learning
![Video Learning](/assets/LearningPage_Video_PesertaDidik.png)

### How To Install?

First, clone the repo:

```bash
git clone <URL>
```

Next, install depedencies (it will generate the prisma scheme instead):

```bash
npm install
```

Next (optional), if you just want to make sure the schema gets generated:

```bash
npx prisma generate
```

Next, change the .env.example into .env.local and fill in all required environment variables (or ask the owner for .env.local file).

run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Creating the first administrator

The admin panel cannot create `ADMINISTRATOR` accounts through its UI (further admins are added via email invite). To create the very first admin on a fresh database:

1. Set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` in `.env.local` (the password must be ≥8 chars with an upper-case, a lower-case letter, and a digit).
2. Run the idempotent bootstrap script:

   ```bash
   npm run bootstrap:admin
   ```

3. Log in at `/login` with those credentials. You will be forced to change the password on first login, then land on `/admin/dashboard`.

From the admin panel, go to **Akun Admin** (`/admin/admins`) to invite more administrators by email (single-use link, valid 24h). When `RESEND_API_KEY` is not set, the invite link is printed to the server console (and returned to the inviting admin) so you can deliver it manually during local development.

### Resetting the database (DESTRUCTIVE)

To wipe all application data and start from an empty platform (keeps platform configuration in `platform_setting`):

```bash
npm run reset:data
```

This deletes every domain table — users, courses, orders, certificates, vouchers, badges, attendance, tasks, grades, the internship structure (batch/field/class), plus categories, holidays, and audit logs. There is no backup; use with care.
