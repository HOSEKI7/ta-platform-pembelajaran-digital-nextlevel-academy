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

next, install depedencies:

```bash
npm install
```

next, generate the prisma schema:

```bash
npx prisma generate
```

next, change the .env.example into .env.local and fill all variable (or ask the owner for .env.local file).

run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Rate Limiting (self-hosted Redis, optional)

Abuse-sensitive endpoints (`POST /api/orders`, `POST /api/vouchers/validate`) are
rate limited. The backend is chosen automatically by the `RATE_LIMIT_REDIS_URL`
env var, and the limiter **fails open** — a Redis outage never blocks a purchase.

**Development — nothing to do.** Leave `RATE_LIMIT_REDIS_URL` empty. The limiter
uses an in-memory store, so a fresh clone runs the full app (including a Snap
purchase) on any OS with just `npm install` + `npm run dev`. No Redis required.

**Optional local Redis** (to exercise the Redis path) — needs Docker:

```bash
# 1. Set a strong REDIS_PASSWORD in .env.local
# 2. Start Redis (bound to 127.0.0.1 only):
docker compose up -d redis
# 3. Point the app at it (note the leading ':' — no username):
#    RATE_LIMIT_REDIS_URL="redis://:<password>@127.0.0.1:6379"
# 4. Restart `npm run dev`
```

**Production (self-hosted VPS):**

- Set a strong `REDIS_PASSWORD` and `RATE_LIMIT_REDIS_URL` in the server env, then
  `docker compose up -d redis`.
- Keep Redis private: the compose file binds the port to `127.0.0.1` only — make
  sure your firewall also closes `6379` to the public. Never expose Redis to the
  internet.
- Limits are per user (the endpoints require a session), so no reverse-proxy
  client-IP configuration is needed.
