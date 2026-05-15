# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: NextLevel Academy

E-learning platform for the Indonesian market with gamification (EXP/level/badge/voucher rewards) and an integrated internship system (attendance, tasks, final grades). One-time purchase, lifetime access — no subscription. UI language is Bahasa Indonesia, currency IDR, timezone hardcoded to **WIB (UTC+7)**, date format **DD/MM/YYYY**.

The authoritative product spec is `NextLevel_Academy_PRD_v2.md` at the repo root. Read it before adding features — it defines four user roles (`PESERTA_DIDIK`, `PESERTA_MAGANG`, `MENTOR`, `ADMINISTRATOR`), the gamification formulas (e.g. `REQ(L) = 744 + 124 × (L-1)`, EXP reset on level-up), business rules (e.g. no refunds, 60-min order timeout, quiz cooldown 3 attempts then 30 min), and the full data model in §9.

## Stack snapshot

- **Next.js 16** App Router with **Turbopack** + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (PostCSS plugin, no `tailwind.config.js` — config lives in `src/app/globals.css` via `@theme`)
- **shadcn/ui** — components copied into `src/components/ui/`, `components.json` configured with `neutral` base color, alias `@/*`
- **Prisma 7** with the `prisma-client-js` generator emitting to `src/generated/prisma` (gitignored). Prisma 7 has no bundled query engine — `PrismaClient` is instantiated with the **`@prisma/adapter-pg`** driver adapter. DB URL is supplied through `prisma.config.ts`, **not** through the `datasource` block
- **Better Auth** for sessions / email-password / email verification — server at `src/lib/auth.ts`, catch-all handler at `src/app/api/auth/[...all]/route.ts`, browser client at `src/lib/auth-client.ts`, server helpers at `src/lib/auth-server.ts` (`getSession` / `requireAuth` / `requireRole` / `requireAdmin` / `requireRoleInRoute`)
- **TanStack Query** for client-side server state
- **Resend + React Email** for transactional mail (no queue — Resend handles delivery directly). Helper `sendEmail()` in `src/lib/resend.ts` falls back to a `console.warn` when `RESEND_API_KEY` is empty, so signup/reset flows still complete locally. Templates live in `src/emails/`
- **Bunny.net** for video hosting (signed URLs for protected playback)
- **DOKU** (primary) / **Midtrans** (alternative via `midtrans-client`) — webhook-driven payments
- **Supabase** (managed PostgreSQL + storage for non-video assets)
- **Zod** validation, **react-hook-form** + `@hookform/resolvers`, **@react-pdf/renderer** for certificates, **Tiptap** for rich-text course descriptions, **Recharts** for admin analytics

## Common commands

```bash
npm run dev            # next dev (Turbopack) — http://localhost:3000
npm run build          # production build
npm run start          # serve built app
npm run lint           # eslint (uses eslint.config.mjs)
npx tsc --noEmit       # type-check without emitting

npx prisma generate    # regenerate client into src/generated/prisma after schema changes
npx prisma migrate dev # create + apply a dev migration (loads .env.local via prisma.config.ts)
npx prisma studio      # GUI for the connected DB

npx shadcn@latest add <component>   # add another shadcn component
npx playwright test                  # run e2e tests (when added)
```

There is currently **no test suite** wired up. `@playwright/test` is installed for future E2E work.

## Environment

- Runtime config lives in `.env.local` (gitignored). `.env.example` is the public template.
- `prisma.config.ts` explicitly loads `.env.local` first, then `.env`, so Prisma CLI commands work without extra flags.
- Key vars: `DATABASE_URL` + `DIRECT_URL` (Supabase pooled + direct), `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `BUNNY_STREAM_*` (incl. `TOKEN_AUTH_KEY` for signed URLs), `DOKU_*` / `MIDTRANS_*`, `NEXT_PUBLIC_SUPABASE_*`. See `.env.example` for the full list.

## Architecture notes that span files

- **Fullstack Next.js, no separate API server.** Backend logic lives in App Router Route Handlers (`src/app/api/**/route.ts`). REST, not tRPC/GraphQL — decided in PRD §8.3.
- **Three distinct app surfaces by role**, each with its own sidebar and route group (see PRD §5):
  - `/dashboard`, `/my-courses`, `/learn/:slug`, `/certificates`, `/exp-level`, `/transactions` — Peserta Didik
  - `/internship/*` — Peserta Magang (separate sidebar; **no** access to courses/EXP/transactions)
  - `/mentor/*` — Mentor
  - `/admin/*` — Administrator
  Role gating must happen server-side; the gamification system (EXP, levels, badges, voucher rewards) applies **only** to `PESERTA_DIDIK`.
- **Prisma client is a singleton.** Import from `@/lib/prisma`, never instantiate `PrismaClient` directly — the helper wires the `@prisma/adapter-pg` adapter to `DATABASE_URL` and guards against hot-reload connection leaks in dev. The generated client path (`src/generated/prisma`) is gitignored, so `prisma generate` is required after a clean clone. Any throwaway script that needs the client must also pass `{ adapter, ... }` to the constructor (see `scripts/verify-db.ts`).
- **Payment flow is webhook-driven and must be idempotent.** Orders are created `PENDING` with a 60-minute expiry; status transitions to `SUCCESS`/`FAILED` come from DOKU/Midtrans webhooks (signature-validated). A scheduled job flips abandoned `PENDING` orders to `EXPIRED`. Once `SUCCESS`, status is immutable. Double-purchase is blocked at the backend (check existing `Enrollment` *and* existing `PENDING` order for the same user+course).
- **Internship matching uses Class as the single join key** — Class encodes Batch + Field in its name (e.g. `Batch 1 - Web Programming - A`). Mentors only see students sharing their Class. Max 10 students per class.
- **Bunny.net videos require signed URLs** generated server-side using `BUNNY_STREAM_TOKEN_AUTH_KEY`. Never expose the raw library token to the client.
- **Certificates are PDFs generated on-demand** via `@react-pdf/renderer` after `progressPct === 100`. Certificate number format: `NLA-YYYYMMDD-XXXXXXXX`. Verification page `/verify/:certificateId` is public (no auth).
- **EXP awards are one-shot per source.** `+15` per video completion, `+90` first-pass quiz, `+600` on course completion — already-awarded sources must not re-grant EXP. `UserGameProfile.exp` resets to 0 on level-up; `totalExp` is cumulative. Voucher rewards (20%/35%/50%) auto-issue at levels 5/10/15 with random case-sensitive codes.

## Gotchas in this codebase specifically

- `AGENTS.md` warns this is **Next.js 16**, not the version most training data covers. Conventions and APIs may differ; check `node_modules/next/dist/docs/` when uncertain.
- `prisma/schema.prisma` intentionally **does not** declare `url = env("DATABASE_URL")` in the `datasource` block — Prisma 7 with `prisma.config.ts` forbids that. Don't "fix" it back.
- `prisma.config.ts` deliberately prefers `DIRECT_URL` (session-mode pooler on port 5432) over `DATABASE_URL` (transaction-mode pooler on port 6543), because Supabase free-plan IPv4 access must go through the pooler and DDL operations (`prisma db push`, `prisma migrate`) only work in session mode.
- `src/components/ui/calendar.tsx` (shadcn template) references a `table` className that exists only in `react-day-picker` **v9**; the dep is pinned to `^9` for this reason. Don't upgrade to v10 without rewriting the calendar template.
- `src/hooks/use-mobile.ts` contains an `eslint-disable-next-line react-hooks/set-state-in-effect` for the initial-sync `setIsMobile` call — this matches the shadcn template and shouldn't be "cleaned up."
- `next-env.d.ts` and `src/generated/prisma/` are gitignored — never commit them.
- **Next.js 16 renamed `middleware.ts` → `proxy.ts`**. The exported function is `proxy()`, not `middleware()`. The config matcher block stays the same. Don't rename it back.
- Better Auth's role-based gating is split across two runtimes: `src/proxy.ts` (Edge) does only the cheap "is there a session cookie?" check; role enforcement happens in Server Components / Route Handlers via `requireRole()` / `requireRoleInRoute()` from `@/lib/auth-server` (Node runtime — has Prisma).
- Password complexity (PRD §6.1.1: ≥8 chars + upper + lower + digit) is enforced by a `hooks.before` `createAuthMiddleware` in `auth.ts`, not by Better Auth's built-in `minPasswordLength` alone. The hook intercepts `/sign-up/email`, `/reset-password`, and `/change-password` paths.
- The `nextCookies()` plugin must be the **last** entry in Better Auth's `plugins` array — it relies on running after every other plugin has touched the response cookies.

---

## Code Conventions

**General**
- UI text: Bahasa Indonesia. Code, variable names, comments: English.
- Never use `any` in TypeScript — use `unknown` and narrow it, or define a proper type.
- `type` for object shapes; `interface` only when extending. Always `const` over `let`.

**Components**
- Named exports everywhere except `page.tsx` / `layout.tsx` (Next.js requires default export).
- File names: `kebab-case.tsx`. Component names: `PascalCase`.
- Server Components by default. Add `"use client"` only when required.
- Always define an explicit `Props` type above the component.

**API Route Handlers**
- Validate body with Zod first, then `requireAuth()` / `requireRole()`.
- Response shape: `{ data }` on success · `{ error: string }` on failure.
- Correct HTTP codes: 200, 201, 400, 401, 403, 404, 409, 500.

**Data Fetching**
- Server Components: direct fetch, no TanStack Query.
- Client Components: TanStack Query only — never raw `fetch` inside component bodies.
- All `useQuery` / `useMutation` logic goes in `src/hooks/`.

**Styling**
- Tailwind utility classes only. `cn()` from `src/lib/utils.ts` for conditional classes.
- Customize shadcn components via `className` prop only. Mobile-first: `sm:` → `md:` → `lg:`.

**Forms**
- React Hook Form + Zod resolver. Schemas in `src/lib/validations/`, shared client and server.
- Submit button must have loading + disabled state during submission.

**Error Handling**
- All API routes wrapped in try/catch. User-facing errors must be specific, never generic.
- Use shadcn Toaster for all client-side feedback.

---

## Workflow

### Plan Mode
- Enter plan mode for any task with 3+ steps or architectural decisions.
- Write plan to `tasks/todo.md` with checkable items. Check in before starting implementation.
- If something goes sideways mid-task: STOP, re-plan, then continue.

### Task Management
1. Write plan to `tasks/todo.md`
2. Check in with me before starting
3. Mark items complete as you go
4. Summarize changes at the end

### Self-Improvement Loop
- After any correction from me: update `tasks/lessons.md` with the pattern.
- Write a rule that prevents the same mistake. Review it at the start of the next relevant session.

### Verification Before Done
- Never mark a task complete without proving it works.
- Run the dev server, check the relevant page/endpoint, verify database state in Prisma Studio.
- Ask yourself: "Would a senior developer approve this PR?"

### Elegance Check (Non-trivial changes only)
- Pause and ask: "Is there a simpler way to do this?"
- If a fix feels hacky: implement the clean solution instead.
- Skip for simple, obvious changes — don't over-engineer.

### Bug Fixing
- When given a bug report: just fix it. Point at the logs/error, resolve it.
- No hand-holding required from me.

---

## Additional Instructions

- **If my prompt is ambiguous, ask first before writing any code.**
- **Always use Context7** to fetch up-to-date library documentation before implementing (Better Auth, Prisma, TanStack Query, shadcn/ui, Resend, etc.).
- **After completing any task, always provide follow-up instructions:** what and how to run, what and how to check in the browser, what and how to verify — specific to what was just built.
- **Never implement anything outside the current task scope.**
- **Database changes go through `prisma/schema.prisma` only.** After any schema change, remind me to run `npx prisma generate && npx prisma db push`.
- **New env vars:** add to both `.env.local` (with placeholder) and `.env.example`.
- **Currency:** IDR — `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`. **Date:** DD/MM/YYYY. **Timezone:** WIB (UTC+7), hardcoded.
- **Landing page is light mode only.** App areas (dashboard, admin, etc.) default to light.
- **do init after every task to save the memory.**
- **After completing any task, always provide short summary paragraph as output:** about what was just do or built and suggested next steps.
- **commit with simple message like human but professional, dont make it look like ai generate.**