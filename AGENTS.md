# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: NextLevel Academy

Indonesian e-learning platform with gamification (EXP/level/badge/voucher) and integrated internship system (attendance, tasks, grading). One-time course purchase, lifetime access — no subscriptions.

- **Locale:** Bahasa Indonesia (UI text), English (code/comments)
- **Currency:** IDR — `Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR' })`
- **Timezone:** WIB (UTC+7) hardcoded. Date format DD/MM/YYYY
- **PRD:** `docs/NextLevel_Academy_PRD_v2.md` — authoritative spec. Read before adding features. Update PRD if implementation diverges.
- **Roles:** `PESERTA_DIDIK` (student), `PESERTA_MAGANG` (intern), `MENTOR`, `ADMINISTRATOR`

## Tech Stack

| Layer         | Tech                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router + Turbopack + React 19 + TypeScript 5                                               |
| Styling       | Tailwind CSS v4 (PostCSS plugin, config in `globals.css` `@theme`, NO `tailwind.config.js`)               |
| Components    | shadcn/ui (base-nova style, `@base-ui/react`, Lucide icons, CVA) — `src/components/ui/`                   |
| ORM           | Prisma 7 + `@prisma/adapter-pg` driver adapter → `src/generated/prisma` (gitignored)                      |
| Auth          | Better Auth — `src/lib/auth.ts`, client `src/lib/auth-client.ts`, server helpers `src/lib/auth-server.ts` |
| Client state  | TanStack Query v5 (hooks in `src/hooks/`), react-hook-form + Zod                                          |
| Payment       | Midtrans Snap (webhook-driven)                                                                            |
| Video/Storage | Bunny.net Stream (signed URLs) + Bunny Storage (object-paths, signed on read)                             |
| Certificates  | Satori JSX → Sharp PNG → pdf-lib PDF wrapper. NO `@react-pdf/renderer`, NO headless browser               |
| Email         | Resend + React Email (`src/emails/`) — falls back to `console.warn` without API key                       |
| Cache         | Redis (ioredis + rate-limiter-flexible), in-memory fallback                                               |
| DB            | Supabase managed PostgreSQL                                                                               |

## Commands

```bash
npm run dev                # next dev (Turbopack) — localhost:3000
npm run build              # production build (standalone when BUILD_STANDALONE=1)
npm run start              # serve built app
npm run lint               # eslint
npx tsc --noEmit           # type-check

npx prisma generate        # regenerate client after schema changes
npx prisma db push         # push schema (uses session-mode pooler via prisma.config.ts)
npx prisma studio          # DB GUI

npx shadcn@latest add <component>
npx tsx scripts/<name>.ts  # one-off scripts (bootstrap, verify, backfill)
npm run verify:bunny       # Bunny connectivity diagnostic

# E2E (Playwright — installed, not yet wired up)
npm run test:e2e           # playwright test
npm run test:e2e:ui        # playwright test --ui
npm run test:e2e:install   # playwright install chromium
```

## Architecture

### Route Groups by Role

```
src/app/(student)/    — /dashboard, /my-courses, /learn/:slug, /certificates, /exp-level, /transactions
src/app/(internship)/ — /internship/* (no courses/EXP/transactions)
src/app/(mentor)/     — /mentor/*
src/app/(admin)/      — /admin/*
src/app/(auth)/       — /login, /register, etc.
src/app/(public)/     — public pages, blog, certificate verification
src/app/(checkout)/   — /checkout/[slug]
src/app/(player)/     — course video/quiz player
src/app/api/          — REST route handlers (no tRPC/GraphQL)
```

Role gating is **server-side** via `requireRole()`/`requireRoleInRoute()`. Gamification applies only to `PESERTA_DIDIK`. New student pages go under `(student)/` to inherit `DashboardShell` + role gate.

### Key Singletons & Patterns

- **Prisma client:** Import from `@/lib/prisma`, never `new PrismaClient()`. Handles hot-reload + adapter wiring.
- **Edge middleware:** `src/proxy.ts` (NOT `middleware.ts` — Next.js 16 rename). Export `proxy()`, not `middleware()`. Does cheap session-cookie check only; role enforcement in Server Components/Route Handlers.
- **Payment:** Orders `PENDING` → 60-min expiry → `SUCCESS`/`FAILED` from Midtrans webhook (signature-validated + amount-matched). Cron `/api/cron/expire-orders` runs every 5 min. `fulfillOrderPaid` is single idempotent success path. Double-purchase blocked server-side.
- **Data fetching:** Server Components = direct DB. Client Components = TanStack Query only (never raw fetch). All hooks in `src/hooks/`.
- **Validation:** Zod schemas in `src/lib/validations/`, shared client+server. API routes validate body with Zod first, then auth.
- **Admin list pages:** loader (server-only) → API route → TanStack hook → URL-stateful view, `PAGE_SIZE=10`, `Promise.all` count+findMany, anti-N+1.

### Certificates Pipeline

Satori JSX (`certificate-image.tsx`) → Sharp PNG (2000×1414) → Bunny cert zone (tokenless CDN). PDF = `pdf-lib` wrapping that PNG. `Certificate.recipientName` snapshotted at issuance — immutable after `claimedAt` set. Render routes must be `runtime = "nodejs"`.

### Gamification

- EXP: +15/video, +90/first-pass quiz, +600/course completion (one-shot via `ExpLog`)
- Level formula: `REQ(L) = 744 + 124 * (L-1)`, exp resets on level-up, max 1 level/award
- Voucher rewards at L5(20%)/L10(35%)/L15(50%), claimed via button, valid 180 days
- Quiz: ≥80 to pass, 3 attempts then 30-min cooldown

### Internship

- Class = single join key (encodes Batch+Field, e.g. "Batch 1 - Web Programming - A"), max 10 students/class
- Attendance: only `PRESENT` rows written; past workdays without row = `TIDAK_HADIR`
- Dates stored UTC-midnight; check-in window global constant `INTERNSHIP_CHECKIN_WINDOW` (09:00–12:00 WIB)

## Critical Gotchas

**Prisma/DB:**

- `prisma/schema.prisma` intentionally omits `url = env("DATABASE_URL")` in datasource — Prisma 7 + `prisma.config.ts` forbids it. Don't "fix" it.
- `prisma.config.ts` prefers `DIRECT_URL` (session-mode :5432) over `DATABASE_URL` (txn-mode :6543) for DDL ops.
- Don't gate errors on `err instanceof Prisma.PrismaClientKnownRequestError` — bundle splits cause false negatives. Duck-type: `err.code === "P2002"` (see `isUniqueConstraintError()`).
- Inside `$transaction`, never `try { create } catch (P2002) { skip }` — first failure aborts entire Postgres transaction. Use `createMany({ skipDuplicates: true })` instead.
- After schema change, restart dev server after `prisma generate` — cached old client throws "Unknown argument".
- Migrations adding non-null columns to populated tables: ADD nullable → UPDATE → SET NOT NULL. Never `--force-reset`.
- `src/generated/prisma/` and `next-env.d.ts` are gitignored — never commit. Run `prisma generate` after clean clone.

**Next.js 16:**

- `middleware.ts` renamed to `proxy.ts`, export `proxy()` not `middleware()`. Don't rename back.
- `queryKey` arrays exported from `"use client"` files become client-reference proxies in RSC — breaks `prefetchQuery`. Put keys in neutral `src/lib/*-query.ts` modules (no directive).

**React/UI:**

- Theme is custom `ThemeProvider` (NOT `next-themes`). Anti-FOUC via `next/script` `beforeInteractive`. Don't reinstall next-themes.
- No `Date.now()`/`new Date()` in `useState` init for SSR components — hydration mismatch. Init `null`, compute in `useEffect`.
- `react-day-picker` pinned to v9 — calendar component depends on v9-specific classNames.
- base-ui `Select.Value` renders raw value — use `children` render-fn for labels. `Button` with `render=<Link>` needs `nativeButton={false}`.
- Invoice PNG export uses `html-to-image` (not `html2canvas` — fails on oklch). Exported subtree must use explicit hex colors.

**Bunny Storage:**

- `Course.thumbnailUrl`/`instructorImg` store object-paths, NOT URLs. Every loader must wrap with `resolveCourseImageUrl()` before rendering, or thumbnail = blank 404.
- Bunny CDN host (`*.b-cdn.net`) must be in `next.config.ts` `images.remotePatterns`.
- Task images store `data-bunny-path` in Tiptap, re-signed on read. Max 1 image per task/quiz question.

**Satori (certificates):**

- Flexbox only — no grid, no advanced CSS. Every multi-child div needs explicit `display:flex`.
- Fonts from `src/lib/certificates/fonts/*.ttf` via `fs` — bundled via `outputFileTracingIncludes`. Images must be data URIs (WebP → PNG via Sharp first).
- `sharp` in `serverExternalPackages`.

**Auth:**

- Password complexity (≥8 + upper + lower + digit) enforced by `createAuthMiddleware` hook in `auth.ts`, not `minPasswordLength` alone.
- `nextCookies()` plugin must be **last** in Better Auth `plugins` array.
- Forced-password-change: route uses `getSession` (not `requireAuth` which `redirect()`s — invalid in route handler). After change, client `signOut()`+redirect to `/login` to bypass 5-min `cookieCache`.

**Tailwind:**

- `calc()` in arbitrary values needs underscores for spaces: `right-[calc(25%_-_3.25rem)]` not `right-[calc(25%-3.25rem)]`.

## Code Conventions

- **Files:** kebab-case. Components PascalCase. Named exports everywhere except `page.tsx`/`layout.tsx` (Next.js default export).
- **Types:** `type` for object shapes, `interface` only when extending. No `any`/`unknown`. Use Prisma generated types from `src/generated/prisma`. Prefer `satisfies` over explicit annotations.
- **Components:** Server Components by default. `"use client"` only for state/effects/browser APIs. No component >300 lines. Explicit `Props` type above each component.
- **API routes:** Zod validate → `requireAuth()`/`requireRole()` → logic. Response: `{ data }` or `{ error: string }`. Correct HTTP codes.
- **Styling:** Tailwind utilities only, `cn()` for conditional. Mobile-first responsive.
- **Forms:** react-hook-form + Zod resolver. Schemas in `src/lib/validations/`. Submit buttons need loading+disabled state.

## Environment

Config in `.env.local` (gitignored). Template in `.env.example`. **Add every new var to both files.**

Key variable groups:

- `DATABASE_URL` + `DIRECT_URL` (Supabase pooled + direct)
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`
- `MIDTRANS_*` + `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- `BUNNY_STREAM_{LIBRARY_ID,TOKEN_AUTH_KEY,API_KEY,CDN_HOSTNAME}` + `BUNNY_WEBHOOK_SECRET`
- `BUNNY_STORAGE_{ZONE_NAME,ACCESS_KEY,REGION,PULL_ZONE,TOKEN_AUTH_KEY}`
- `BUNNY_CERT_STORAGE_*` + `BUNNY_CERT_PULL_ZONE`
- `CRON_SECRET`, `RATE_LIMIT_REDIS_URL`, `NEXT_PUBLIC_SUPABASE_*`

## Design System

- **Palette:** Primary `#478EF4`, Secondary `#F4D600`, Text `#1A1A2E`, Success `#22C55E`, Error `#EF4444`, Warning `#F59E0B`
- **Font:** Poppins
- **Theme:** Light default. Landing/auth/public = light only. Dashboards = light+dark (custom ThemeProvider)
- **Components:** shadcn/ui primitives in `src/components/ui/`. Use design-system tokens from `globals.css`

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`): `tsc --noEmit` → `lint` → `npm audit` → `build` → tarball deploy to VPS via SSH. Triggers on push to `main` or manual dispatch.

Local: `docker-compose.yml` runs Redis 7 Alpine for rate limiting.

## Hard Rules

- **Never push to the GitHub repo** — user pushes manually
- **Never implement outside current task scope**
- **DB changes through `prisma/schema.prisma` only** — after schema change, remind to run `npx prisma generate && npx prisma db push`
- **If implementation diverges from PRD, update the PRD**
- Use Context7 MCP to fetch up-to-date library docs before implementing
- Provide summary output with Indonesian (even if i prompting in english)
