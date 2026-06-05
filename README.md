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
