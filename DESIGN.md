# NextLevel Academy — Current Design System Audit

> **Platform Overview:** NextLevel Academy is a Next.js App Router (React 19, Tailwind CSS v4, `@base-ui/react`, Lucide) digital learning platform featuring integrated gamification (EXP, Levels, Badges), a high-focus course video player ("Focus Theater"), an internship management system (Peserta Magang & Mentor portals), an administrator backoffice, and a public marketing catalog.

**Theme Mode:** Adaptive Multi-Theme (Light by default, Dark mode via `next-themes` / `.dark` class, with hard-pinned `.auth-light-scope` on authentication pages and a dark-first stage in the Course Player).

---

# PART 1: The In-Use Design System

This section documents the actual design system as it currently exists in the codebase — reflecting real, verified patterns across components, styles, and configurations.

---

## 1. Visual Theme & Atmosphere

NextLevel Academy combines the aesthetic of a **modern digital academy** with **vibrant gamification elements**. Visual depth is created through atmospheric radial gradients, subtle dot/grid overlays, multi-stop colored glow shadows, and soft rounded geometry (`rounded-2xl` to `rounded-full`).

### Surface Hierarchy (3-Tier Workspace Architecture)
To provide depth without pitch-black flatness in dark mode, dashboard shells ([`admin-shell.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/admin-shell.tsx#L43-L112), [`dashboard-shell.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/dashboard-shell.tsx#L44-L115), [`mentor-shell.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/mentor-shell.tsx#L44-L115), [`internship-shell.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/internship/internship-shell.tsx#L44-L115)) adhere to an explicit 3-tier elevation model:

| Level | Token | Light Value | Dark Value | In-Use Role |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0 (Canvas)** | `--color-surface-app` | `#f7f8fb` | `#0b0d12` | Full-bleed workspace background with ambient blue radial light |
| **Tier 1 (Navigation)** | `--color-surface-nav` | `#ffffff` | `#14171f` | Sticky topbar and desktop rail / mobile drawer sidebar |
| **Tier 2 (Card / Panel)** | `--color-surface-card` | `#ffffff` | `#1c2030` | Content cards, data tables, modals, and list items |
| **Tier 2+ (Elevated)** | `--color-surface-card-strong` | `#ffffff` | `#262b3e` | Hovered cards, active rows, dropdowns, and nested sub-cards |
| **Divider (Hairline)** | `--color-surface-border` | `#e4e7ec` | `#2a2f3d` | 1px perimeter border on cards, tables, and section separators |
| **Divider (Strong)** | `--color-surface-border-strong`| `#cdd2db` | `#3a4055` | High-contrast boundaries and active ring borders |

### Distinct Experience Zones
1. **Public Marketing (`src/app/(public)`):** Full-bleed light canvas with layered atmospheric blue-to-yellow radial halos, dynamic 3D floating assets (`nla-3d-logo.webp`), and GPU-accelerated scroll-reveal entry animations.
2. **Student Dashboard & Gamification (`src/app/(student)`):** Adaptive light/dark workspace featuring saturated brand blue CTAs, conic-gradient XP level rings, and interactive reward roadmaps.
3. **Course Player ("Focus Theater", `src/app/(player)`):** Dark-first cinema stage (`--player-stage: #08090d`) with an emissive blue video halo (`.player-halo`), dot-grid sidebar texture (`.player-dot-grid`), and minimal chrome to maximize learning concentration.
4. **Internship & Mentor Portals (`src/app/(internship)`, `src/app/(mentor)`):** Information-dense operational surfaces with attendance calendars, grade scorecard heroes, and class context popover chips.
5. **Admin Backoffice (`src/app/(admin)`):** Analytical command center with metric KPI cards, monthly Recharts visualizations, sortable tables, and role-tinted badge pills.
6. **Authentication (`src/app/(auth)`):** Hard-pinned light mode split-screen with a left form container and a right visual brand panel with orbiting reward chips.

---

## 2. Color System & Tokens

### 2.1 Brand Palette (Blue Scale)
Derived from the platform core identity (`#478EF4`). Defined in [`src/app/globals.css:L14-L24`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L14-L24):

| Token Name | Hex Value | Verified Code Usages | Primary Role in Interface |
| :--- | :--- | :---: | :--- |
| `--color-brand-50` | `#eef5ff` | 380 | Light chip backgrounds, subtle card hover states, input fill in auth |
| `--color-brand-100` | `#d8e7fe` | 101 | Chip ring borders, light input borders, certificate borders |
| `--color-brand-200` | `#b8d3fe` | 155 | Hover ring borders, hero badge borders, dark-mode text accents |
| `--color-brand-300` | `#88b5fc` | 111 | Interactive ring focus, dark-mode link highlights, blockquote borders |
| `--color-brand-400` | `#5395f8` | 69 | Focus rings, intermediate gradient stops, active dark rings |
| `--color-brand-500` | `#478ef4` | 289 | **Primary Brand Color**: Primary buttons, active tabs, progress bars, logos |
| `--color-brand-600` | `#2b72ea` | 130 | Button hover fills, gradient anchors, chart stroke highlights |
| `--color-brand-700` | `#225bd7` | 278 | **Primary Text Accent**: Headings, eyebrow labels, link text, active indicators |
| `--color-brand-800` | `#234aae` | 47 | Text hover states on brand-50 backgrounds, high-contrast dark accents |
| `--color-brand-900` | `#234189` | 53 | Deep blue text on light chips, badge text on yellow accents |
| `--color-brand-950` | `#19295a` | 7 | Deepest gradient start for hero cards and certificate base |

### 2.2 Brand Accent (Yellow Scale)
Defined in [`src/app/globals.css:L29-L30`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L29-L30):

| Token Name | Hex Value | Usages | Primary Role in Interface |
| :--- | :--- | :---: | :--- |
| `--color-brand-accent` | `#f4d600` | 105 | **Secondary Identity Accent**: XP sparkles, discount badges, "Next Level" underline, reward stars |
| `--color-brand-accent-soft` | `#fff4a3` | 3 | Rich text highlight background (`<mark>`), light yellow gradient stops |

### 2.3 Course Player ("Focus Theater") Tokens
Defined in [`src/app/globals.css:L95-L104`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L95-L104) and [`L203-L212`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L203-L212):

| Token Name | Light Value | Dark Value | Role in Player Interface |
| :--- | :--- | :--- | :--- |
| `--player-stage` | `#f3f5fa` | `#08090d` | Deep video stage background surrounding the screen |
| `--player-surface` | `#ffffff` | `#11141c` | Sidebar card surface, curriculum item background |
| `--player-surface-strong` | `#f7f8fb` | `#181c28` | Hovered/active step card background in curriculum |
| `--player-hairline` | `rgba(15,23,42,0.08)` | `rgba(255,255,255,0.06)` | Subtle hairline divider between modules/steps |
| `--player-hairline-strong` | `rgba(15,23,42,0.16)` | `rgba(255,255,255,0.12)` | High-emphasis borders around current step |
| `--player-glow` | `rgba(71,142,244,0.10)`| `rgba(71,142,244,0.18)`| Emissive radial glow halo behind the video frame |
| `--player-glow-soft` | `rgba(71,142,244,0.04)`| `rgba(71,142,244,0.06)`| Secondary ambient light spread |
| `--player-accent` | `#478ef4` | `#5395f8` | Active step numbers, completed checkmarks, quiz buttons |
| `--player-accent-yellow` | `#f4d600` | `#f4d600` | Quiz point awards, trophy icons, highlight tags |
| `--player-dot` | `rgba(15,23,42,0.06)` | `rgba(255,255,255,0.05)` | Background radial dot-grid pattern (`18px x 18px`) |

### 2.4 Semantic & Functional Color Mapping
The platform uses functional color sets for status messaging and role badges:

| Purpose | Light Theme | Dark Theme | Example Component Citation |
| :--- | :--- | :--- | :--- |
| **Success / Published** | `bg-emerald-50 text-emerald-700 ring-emerald-200` | `dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30` | [`course-status-badge.tsx:L16`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/course-status-badge.tsx#L16), [`transaction-status.tsx:L31`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/transaction-status.tsx#L31) |
| **Warning / Draft / Pending**| `bg-amber-50 text-amber-700 ring-amber-200` | `dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30` | [`course-status-badge.tsx:L21`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/course-status-badge.tsx#L21), [`transaction-status.tsx:L25`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/transaction-status.tsx#L25) |
| **Danger / Failed / Destructive**| `bg-red-50 text-red-700 ring-red-200` | `dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30` | [`transaction-status.tsx:L37`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/transaction-status.tsx#L37), [`delete-course-dialog.tsx:L39`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/delete-course-dialog.tsx#L39) |
| **Canceled / Admin Role** | `bg-rose-50 text-rose-700 ring-rose-200` | `dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30` | [`user-role-badge.tsx:L25`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/users/user-role-badge.tsx#L25), [`transaction-status.tsx:L49`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/transaction-status.tsx#L49) |
| **Peserta Magang Role** | `bg-violet-50 text-violet-700 ring-violet-200` | `dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30` | [`user-role-badge.tsx:L17`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/users/user-role-badge.tsx#L17) |
| **Archived / Expired / Neutral**| `bg-zinc-100 text-zinc-600 ring-zinc-200` | `dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15` | [`course-status-badge.tsx:L26`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/course-status-badge.tsx#L26), [`transaction-status.tsx:L43`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/transaction-status.tsx#L43) |

### 2.5 Neutral Palette in Practice: The Zinc Dominance
While shadcn defines `--muted`, `--accent`, and `--border` via OKLCH, the actual component layer relies heavily on **Tailwind's `zinc` palette** (over **3,084 occurrences** in source):
- **Body & High-Contrast Text:** `text-zinc-900` (Light) / `text-zinc-100` or `text-zinc-50` (Dark)
- **Secondary / Subtitle Copy:** `text-zinc-600` (Light) / `text-zinc-300` or `text-zinc-300/80` (Dark)
- **Muted Labels & Metadata:** `text-zinc-500` (524 uses) / `text-zinc-400` (443 uses)
- **Borders & Dividers:** `border-zinc-200` (Light) / `border-zinc-700` or `border-white/10` (Dark)
- **Rings & Outlines:** `ring-zinc-200` (250 uses) / `ring-zinc-700` or `ring-white/15` (38 uses)

---

## 3. Typography Rules & Scale

### 3.1 Font Families
Configured in [`src/app/layout.tsx:L12-L23`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/layout.tsx#L12-L23) and [`src/app/globals.css:L10-L12`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L10-L12):

```typescript
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
```

- **`Poppins` (`--font-poppins`, `font-sans`, `font-heading`):** Used universally across all UI elements, headings, body text, buttons, and marketing pages.
- **`Geist Mono` (`--font-geist-mono`, `font-mono`):** Used for code blocks, invoice numbers, timestamps, character counters, EXP numbers, and tabular data.
- **Email Typography:** Transactional emails use system fallback stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` ([`src/emails/_layout.tsx:L91-L93`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/emails/_layout.tsx#L91-L93)).

### 3.2 Font Weight Hierarchy in Real-World Usage
An exhaustive scan of font weight classes shows the following weight usage distribution:

| Tailwind Class | Weight | Usages | Canonical In-Code Role |
| :--- | :---: | :---: | :--- |
| `font-semibold` | 600 | **597** | Standard buttons, table headers, form labels, card titles, status badges |
| `font-bold` | 700 | **379** | Section headers, modal titles, strong body highlights, stat cards |
| `font-medium` | 500 | **144** | Subtle body copy, select item text, secondary links |
| `font-extrabold`| 800 | **118** | Page titles (`h1`), hero slogans, large level numbers (`LevelHeroCard`), scorecard numbers |
| `font-normal` | 400 | **9** | Rarely applied explicitly; acts as the ambient browser default |

### 3.3 Type Scale & Tracking Rules

| Scale Role | Font Size | Line Height | Tracking | Verified Usages | In-Use Purpose & Component Context |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Display (Hero Huge)** | `text-[6.5rem]`–`text-[9rem]` | `0.85` | `tight` | 5 | Level numbers ([`level-hero-card.tsx:L85`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/exp-level/level-hero-card.tsx#L85)), final grade score ([`grade-hero-card.tsx:L92`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/internship/final-grade/grade-hero-card.tsx#L92)) |
| **Fluid Display** | `var(--fluid-display)` (40–72px)| `1.04` | `tight` | 1 | Public hero main headline ([`hero-section.tsx:L53`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/hero-section.tsx#L53)) |
| **Fluid H2** | `var(--fluid-h2)` (30–48px) | `tight` | `tight` | 6 | Landing section titles ([`featured-courses-section.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/featured-courses-section.tsx), [`how-it-works-section.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/how-it-works-section.tsx)) |
| **H1 (Page Header)** | `text-3xl` sm:`text-4xl` (30/36px)| `tight` | `tight` | 34 | Canonical [`PageHeader`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/shared/page-header.tsx#L35) across student and admin views |
| **H2 / Card Title Lg** | `text-2xl` (24px) | `snug` | `tight` | 37 | Major section titles, modal headers, certificate recipient name |
| **H3 / Card Title Md** | `text-xl` (20px) | `snug` | `tight` | 25 | Course cards, metric values, attention card headers |
| **H4 / Card Title Sm** | `text-lg` (18px) | `snug` | `normal`| 37 | Sub-cards, dialog titles, empty state headers |
| **Body (Default)** | `text-base` (16px) | `relaxed` | `normal`| 90 | Editorial paragraphs, input text on mobile (prevents iOS auto-zoom) |
| **Body Small** | `text-sm` (14px) | `relaxed` | `normal`| **512** | **Primary UI Text**: Table cells, descriptions, form hints, button labels |
| **Caption / Meta** | `text-xs` (12px) | `normal` | `normal`| **394** | Secondary labels, timestamps, char counters, tooltips |
| **Micro Eyebrow** | `text-[11px]` | `tight` | `0.18em`–`0.22em` | **243** | Uppercase section eyebrows, compact pill badges, chip subtitles |
| **Mini Overline** | `text-[10px]` | `none` | `0.14em`–`0.32em` | **106** | Level tags, small discount badges, table uppercase column headers |

### 3.4 Fluid Scale Variables (Landing Surface)
Defined in [`src/app/globals.css:L141-L147`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L141-L147):
```css
--nav-h: 68px;
--fluid-section-y: clamp(4rem, 2.5rem + 4vw, 7rem);
--fluid-display: clamp(2.5rem, 2rem + 2.2vw, 4.5rem);
--fluid-h2: clamp(1.875rem, 1.4rem + 1.6vw, 3rem);
--fluid-cta-h2: clamp(2.25rem, 1.6rem + 2.2vw, 3.75rem);
--fluid-lead: clamp(1rem, 0.96rem + 0.55vw, 1.25rem);
```

### 3.5 Rich Text Prose Rules (`.task-prose`)
Configured in [`src/app/globals.css:L336-L458`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L336-L458) for Tiptap editor rendering:
- **Base:** `font-size: 0.875rem (14px)`, `line-height: 1.7`, `word-break: break-word`
- **Headings:** `h2` at `1.125rem font-bold`, `h3` at `1rem font-bold` with `--font-heading`
- **Links:** `var(--color-brand-700)` with `underline-offset: 2px` (dark: `var(--color-brand-300)`)
- **Blockquotes:** Left border `3px solid var(--color-brand-300)` (dark: `var(--color-brand-500)`), italicized
- **Code:** Inline `background: rgba(0,0,0,0.06)` with `--font-mono` (dark: `rgba(255,255,255,0.1)`)
- **Highlight (`<mark>`):** `var(--color-brand-accent-soft)` (dark: `rgba(244, 214, 0, 0.3)`)

---

## 4. Spacing, Geometry & Elevation Scale

### 4.1 Spacing Scale
The system uses the default 4px Tailwind increment grid. Common macro-rhythms include:
- **Page Vertical Breathing Room:** `gap-10` (40px) or `space-y-8` (32px) between page sections
- **Card Internal Padding:** `p-5` (20px), `p-6` (24px), or `p-7` / `sm:p-9` (28–36px on hero/invoice cards)
- **Toolbar & Search Gutter:** `gap-3` (12px) or `gap-4` (16px)
- **Inline Icon & Label Gap:** `gap-1.5` (6px) or `gap-2` (8px)

### 4.2 Page Containers & Max-Widths
1. **Public Site Container ([`src/components/public/site-container.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/site-container.tsx)):**
   Stepped fluid width responding dynamically across wide monitors:
   ```css
   max-w-7xl (1280px) -> min-[1280px]:max-w-[1360px] -> min-[1536px]:max-w-[1480px] -> min-[1920px]:max-w-[1600px] -> min-[2560px]:max-w-[1840px]
   ```
2. **Dashboard Page Container ([`src/components/dashboard/shared/student-page-container.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/shared/student-page-container.tsx)):**
   - `wide` (default for tables & grids): `max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12`
   - `narrow` (for settings & forms): `max-w-5xl`
3. **Checkout Container ([`checkout-top-bar.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(checkout)/_components/checkout-top-bar.tsx#L18)):** `max-w-6xl` (1152px)
4. **Auth Form Container ([`src/app/(auth)/layout.tsx:L52`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/layout.tsx#L52)):** `max-w-md` (448px) scaling to `min-[1920px]:max-w-[600px]`

### 4.3 Border Radius Scale
Geometry in NextLevel Academy is heavily rounded, soft, and modern:

| Tailwind Class | Approximate Radius | Code Usages | In-Use Component Roles |
| :--- | :---: | :---: | :--- |
| `rounded-full` | `9999px` | **585** | Badges, status pills, avatars, circular icon medallions, pill buttons |
| `rounded-3xl` | `24px` | **133** | Course cards, hero scorecard cards, empty state containers |
| `rounded-2xl` | `16px` | **260** | Standard content cards, preview modals, dialogs, popover containers |
| `rounded-xl` | `12px` | **184** | Form inputs, standard buttons, dropdown menus, table enclosures |
| `rounded-lg` | `8px` | **59** | Base UI primitives (`Button`, `Input`, `DialogContent`) |
| `rounded-md` | `6px` | **30** | Micro-controls, inline icon buttons |

### 4.4 Shadows & Atmospheric Glows
Rather than standard gray drop-shadows, the platform relies on **saturated, multi-stop colored glow shadows** that match component brand tones:

| Shadow Style | Formula | Primary Role & Location |
| :--- | :--- | :--- |
| **Primary Blue CTA Glow** | `shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)]` | Primary action buttons ([`hero-section.tsx:L90`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/hero-section.tsx#L90)) |
| **Primary Blue Button Glow**| `shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)]`| Enrolled course action buttons ([`student-course-card.tsx:L96`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/student-course-card.tsx#L96)) |
| **Accent Yellow Sparkle Glow**| `shadow-[0_8px_18px_-8px_rgba(244,214,0,0.8)]` | Discount tags ([`course-card.tsx:L69`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/course-card.tsx#L69)), task submission pulse |
| **Accent Yellow Radial Aura**| `shadow-[0_0_10px_var(--color-brand-accent)]` | Floater dots ([`brand-panel.tsx:L144`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/_components/brand-panel.tsx#L144), [`hero-section.tsx:L49`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/hero-section.tsx#L49)) |
| **Card Deep Ambient Elevation**| `shadow-[0_24px_50px_-20px_rgba(35,65,137,0.35)]` | Class chip popover ([`internship-class-chip.tsx:L76`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/internship/internship-class-chip.tsx#L76)) |
| **Card Hover Lift Elevation**| `shadow-[0_30px_50px_-30px_rgba(35,65,137,0.4)]` | Public course card hover ([`course-card.tsx:L47`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/course-card.tsx#L47)) |
| **Success / Completed Pill** | `shadow-[0_8px_18px_-8px_rgba(16,185,129,0.7)]` | "Selesai" course badge ([`student-course-card.tsx:L42`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/student-course-card.tsx#L42)) |
| **Destructive Modal Glow** | `shadow-[0_18px_40px_-14px_rgba(220,38,38,0.5)]` | Error boundary and deletion prompts ([`error.tsx:L60`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/error.tsx#L60)) |

---

## 5. Iconography & Visual Assets

### 5.1 Icon Library: `lucide-react` (^1.14.0)
- **Top 10 Most Used Icons:** `Loader2` (83 uses), `Sparkles` (33 uses), `CheckCircle2` (28 uses), `ArrowLeft` (21 uses), `ArrowRight` (21 uses), `Plus` (21 uses), `GraduationCap` (20 uses), `Trash2` (20 uses), `Clock` (19 uses), `Inbox` (19 uses).
- **Icon Sizing Standards:**
  - `size-4` (16px, **421 occurrences**): Default for buttons, navigation links, and input field icons.
  - `size-3.5` (14px, **195 occurrences**): Default for badges, status pills, and compact table controls.
  - `size-5` (20px, **146 occurrences**): Modal icon circles, major section headers.
  - `size-6` (24px, **57 occurrences**): Hero banners, empty states.
  - `size-3` (12px, **45 occurrences**): Micro tags and score card prefixes.
- **Stroke Width Personality:**
  Instead of Lucide's default `strokeWidth={2}`, the codebase deliberately enforces **punchier, bolder strokes**:
  - `strokeWidth={2.4}` (**312 occurrences**): Primary button and navigation icons
  - `strokeWidth={2.2}` (**201 occurrences**): Form and table icons
  - `strokeWidth={2.6}` (**65 occurrences**): Gamification sparkles, checkmarks, and badges

### 5.2 Custom SVG Badges (`/public/badges/`)
Standalone vector assets for gamification tiers:
- `crown.svg` (Top-tier milestone badge)
- `medal-gold.svg` (Gold tier achievement)
- `medal-silver.svg` (Silver tier achievement)
- `medal-bronze.svg` (Bronze tier achievement)
- `trophy.svg` (Course completion trophy)

### 5.3 3D Assets & Avatars (`/public/avatars/`, `src/assets/images/`)
- `nla-3d-logo.webp`: Hero 3D brand render used in the public hero and auth split screen.
- `nla-horizontal-logo.webp`: Standard navbar brand wordmark.
- `nla-logo.webp`: App favicon and square identity icon.
- `Female_1.webp`–`Female_4.webp` & `Male_1.webp`–`Male_4.webp`: Pre-configured user profile avatar choices ([`src/lib/avatars.ts`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/lib/avatars.ts)).

---

## 6. Motion, Animation & Scroll Interactions

All motion is implemented via pure CSS GPU transforms (`transform` and `opacity`) and honors `@media (prefers-reduced-motion: reduce)`.

### 6.1 Keyframe Animations Directory
- **`landing-marquee` (`globals.css:L272-L282`):** `34s linear infinite` continuous brand logo ticker.
- **`landing-gradient-pan` (`globals.css:L285-L296`):** `6s linear infinite` shifting multi-color gradient text.
- **`landing-bar-fill` (`globals.css:L299-L306`):** `1s cubic-bezier(0.22, 1, 0.36, 1)` scaleX fill upon reveal.
- **`auth-logo-float` (`auth.css:L148-L156`):** `6s ease-in-out infinite` gentle 3D logo float with ±1.5° tilt.
- **`auth-orbit` (`auth.css:L170-L178`):** `5.5s ease-in-out infinite` floating motion for XP/Level chips.
- **`auth-glow-pulse` (`auth.css:L158-L168`):** `3.6s ease-in-out infinite` pulsating halo behind hero logo.
- **`task-cta-pulse` (`internship.css:L53-L61`):** `1.8s ease-in-out infinite` attention glow on task submit button.
- **`grade-rise` (`internship.css:L79-L88`):** `700ms cubic-bezier(0.22, 1, 0.36, 1)` scorecard reveal.
- **`player-halo-drift` (`player.css:L46-L49`):** `9s ease-in-out infinite` ambient breathing glow behind video.
- **`exp-progress-shimmer` (`student.css:L5-L12`):** `2.6s ease-in-out infinite` highlight sheen across EXP bars.

### 6.2 Scroll Reveal Architecture
Driven by [`src/components/public/landing/reveal.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/reveal.tsx) and [`src/hooks/use-scroll-reveal.ts`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/hooks/use-scroll-reveal.ts).
- Client mounts -> adds `.reveal-ready` to `<html>` (prevents FOUC on SSR / no-JS users).
- Elements with `[data-reveal]` transition from `opacity: 0; translateY(24px)` to `opacity: 1; transform: none` via `transition: 0.6s cubic-bezier(0.22, 1, 0.36, 1)`.
- Directional variants supported: `data-from="left"` (-28px), `data-from="right"` (+28px), `data-from="scale"` (0.94).

---

## 7. Component Library & In-Use Patterns

### 7.1 Buttons & Triggers
1. **Primary Action Pill (Public & Hero):**
   `h-12 rounded-full bg-[color:var(--color-brand-500)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--color-brand-600)]` ([`hero-section.tsx:L90`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/hero-section.tsx#L90)).
2. **Dashboard Button ([`src/components/ui/button.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/button.tsx)):**
   - `variant="default"`: `bg-primary text-primary-foreground hover:bg-primary/80`
   - `variant="outline"`: `border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30`
   - `variant="destructive"`: `bg-destructive/10 text-destructive hover:bg-destructive/20`
   - `variant="ghost"`: `hover:bg-muted hover:text-foreground`
   - Default height `h-8 px-2.5` (`sm: h-7`, `lg: h-9`).
3. **Floating Sidebar Rail Toggle:**
   `size-7 place-items-center rounded-full bg-white ring-1 ring-zinc-200 text-[color:var(--color-brand-600)] shadow-[0_4px_12px_-4px_rgba(35,65,137,0.25)] hover:scale-[1.08]` ([`admin-shell.tsx:L58`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/admin-shell.tsx#L58)).

### 7.2 Inputs & Form Elements
- **Input Primitive ([`src/components/ui/input.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/input.tsx)):** `h-8 rounded-lg border-input bg-transparent px-2.5 py-1 text-base md:text-sm focus-visible:ring-3 focus-visible:ring-ring/50`.
- **Form Row Wrapper ([`src/components/admin/courses/form/field.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/form/field.tsx)):** Encapsulates `Label` + `CharCounter` + input + error message.
- **Character Counter ([`src/components/ui/char-counter.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/char-counter.tsx)):** `<90%` = muted zinc, `≥90%` = warning amber, `≥100%` = error red + `(Maksimal tercapai)`.

### 7.3 Cards & Content Containers
1. **Standard Entity Card (`rounded-2xl` / `rounded-3xl`):**
   `bg-white ring-1 ring-zinc-200/80 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]`
2. **Interactive Course Card:**
   Aspect ratio `16:9` cover image, category badge top-left, discount pill top-right, bottom gradient veil, instructor avatar pill, formatted IDR price, hover scale `1.03` + lift `-translate-y-1`.
3. **Metric KPI Tile ([`src/components/admin/dashboard/metric-card.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/dashboard/metric-card.tsx)):**
   Icon container in colored tone ring, bold numerical stat, label caption, optional breakdown chip list.

### 7.4 Badges & Status Chips
All status badges follow the **Dot + Label Pill** standard:
`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1` with inner `<span className="size-1.5 rounded-full" />` dot.

### 7.5 Topbar Gamification & Identity Chips
- **`LevelChip` ([`src/components/dashboard/level-chip.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/level-chip.tsx)):**
  `h-10 rounded-full pl-1 pr-3.5 ring-1` containing a conic-gradient EXP progress ring around an inner brand gradient medallion with Sparkles icon, displaying "Lv {level}", opening an EXP detail popover.
- **`InternshipClassChip` & `MentorClassChip`:**
  Matches `LevelChip` height/radius with graduation cap icon and class section identifier ("Kelas A"), opening batch/mentor detail popovers.

---

# PART 2: Audit Findings — Inconsistencies, Anti-Patterns & Accessibility Issues

This section provides an unvarnished catalog of inconsistencies, token bypasses, duplications, and accessibility gaps identified across the codebase, complete with exact file paths and line references.

---

## 1. Architectural Token Anti-Pattern: Universal Arbitrary Escaping

Despite declaring semantic tokens in `@theme inline` in [`src/app/globals.css:L7-L76`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L7-L76) (`--color-brand-50` through `--color-brand-950`, `--color-surface-card`, etc.), the codebase **never uses standard Tailwind v4 token classes** (e.g. `bg-brand-500`, `text-brand-700`, `bg-surface-card`).

Instead, the codebase contains **2,282 instances** of verbose arbitrary variable escape syntax:
- `text-[color:var(--color-brand-700)]` (e.g. [`forgot-password-form.tsx:L44`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/forgot-password/forgot-password-form.tsx#L44), [`login-form.tsx:L87`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/login/login-form.tsx#L87))
- `bg-[color:var(--color-brand-500)]` (e.g. [`level-chip.tsx:L123`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/level-chip.tsx#L123))
- `bg-[color:var(--color-surface-card)]` (e.g. [`student-course-card.tsx:L22`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/student-course-card.tsx#L22))
- `ring-[color:var(--color-surface-border)]` (e.g. [`catalog-course-card.tsx:L65`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/catalog/catalog-course-card.tsx#L65))

**Impact:** Clutters JSX class strings, increases bundle size, and bypasses Tailwind v4's optimized token resolution engine.

---

## 2. Hardcoded Hex & Palette Bypasses in Production Code

Multiple production components hardcode raw hex values or bypass theme tokens:

1. **Recharts Charts Raw Hex Injections:**
   - [`src/components/admin/dashboard/admin-dashboard.tsx:L127`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/dashboard/admin-dashboard.tsx#L127): `color="#478ef4"` passed as prop
   - [`src/components/admin/dashboard/admin-dashboard.tsx:L138`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/dashboard/admin-dashboard.tsx#L138): `color="#10b981"` passed as prop
   - [`src/components/admin/dashboard/revenue-area-chart.tsx:L19`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/dashboard/revenue-area-chart.tsx#L19): `const BRAND = "#2b72ea";`
   - [`src/components/mentor/dashboard/class-attendance-card.tsx:L58-L59`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/dashboard/class-attendance-card.tsx#L58-L59): `{ color: "#a1a1aa" }` and `{ color: "#ef4444" }`
2. **Focus Theater Dark Canvas Bypasses:**
   - [`src/components/course-player/video-stage.tsx:L69`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/video-stage.tsx#L69): `"bg-gradient-to-br from-[#0e1018] via-[#0a0c12] to-[#0e1018]"` (bypasses `--player-stage`)
   - [`src/components/course-player/quiz-intro.tsx:L92`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/quiz-intro.tsx#L92): `focus-visible:ring-offset-[#0e1018]`
   - [`src/components/course-player/quiz-question-slide.tsx:L110`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/quiz-question-slide.tsx#L110): `focus-visible:ring-offset-[#0e1018]`
3. **Viewport Theme Color vs Background Mismatch:**
   - [`src/app/layout.tsx:L83`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/layout.tsx#L83): Viewport themeColor specifies `{ media: "(prefers-color-scheme: dark)", color: "#0b1530" }`, but [`globals.css:L162`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L162) defines dark `--background: #0b0d12`. This creates a visible seam between the mobile browser address bar and page background.
4. **Yellow Token Bypasses in Hero Components:**
   - [`src/components/internship/dashboard/attendance-hero.tsx:L183`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/internship/dashboard/attendance-hero.tsx#L183): `to-[#fff4a3]` (hardcoded hex instead of `var(--color-brand-accent-soft)`)
   - [`src/components/mentor/dashboard/mentor-hero.tsx:L200`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/dashboard/mentor-hero.tsx#L200): `to-[#fff4a3]`
   - [`src/components/dashboard/exp-level/level-hero-card.tsx:L123`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/exp-level/level-hero-card.tsx#L123): `"linear-gradient(90deg, #fde047 0%, var(--color-brand-accent) 50%, #fbbf24 100%)"` (introduces rogue Tailwind yellow-300 `#fde047` and amber-400 `#fbbf24`)
5. **OpenGraph Image Rogue Palette:**
   - [`src/app/(public)/courses/[slug]/opengraph-image.tsx:L95-L112`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(public)/courses/%5Bslug%5D/opengraph-image.tsx#L95-L112): Introduces `#EBF3FE`, `#2B5BB5`, and `#1A1A2E`, which do not match any brand palette tokens.

---

## 3. Dead & Unused UI Primitives

An audit of imports across all 430 TSX files revealed that **9 shadcn/Base UI primitive components** installed in `src/components/ui/` have **ZERO imports anywhere in the codebase**:

| File Path | Component | Reason for Dead Code |
| :--- | :--- | :--- |
| [`src/components/ui/alert.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/alert.tsx) | `Alert`, `AlertTitle`, `AlertDescription` | Codebase builds bespoke inline warning banners (e.g. [`warning-banner.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/internship/config/warning-banner.tsx)) |
| [`src/components/ui/breadcrumb.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/breadcrumb.tsx) | `Breadcrumb` | App uses uppercase eyebrows in [`PageHeader`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/shared/page-header.tsx) instead |
| [`src/components/ui/card.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/card.tsx) | `Card`, `CardHeader`, `CardTitle`, `CardContent` | All cards across the entire application are built using custom `<article>` / `<div>` elements |
| [`src/components/ui/input-group.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/input-group.tsx) | `InputGroup`, `InputGroupAddon` | Input adornments are styled directly via relative wrappers in forms |
| [`src/components/ui/navigation-menu.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/navigation-menu.tsx) | `NavigationMenu` | Public navbar uses custom [`NavLink`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/nav-link.tsx) and [`MobileNav`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/mobile-nav.tsx) components |
| [`src/components/ui/pagination.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/pagination.tsx) | `Pagination` (shadcn) | Replaced by 2 separate custom pagination components |
| [`src/components/ui/scroll-area.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/scroll-area.tsx) | `ScrollArea` | Native CSS `overflow-y-auto` used throughout |
| [`src/components/ui/separator.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/separator.tsx) | `Separator` | Custom `border-t` divs or `<hr>` elements used instead |
| [`src/components/ui/sidebar.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/sidebar.tsx) | `Sidebar` (shadcn) | Each portal implements its own bespoke sidebar component |

Additionally:
- **`Badge` ([`src/components/ui/badge.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/badge.tsx)):** Only imported in 2 files; all other badges in the app are bespoke `<span>` elements with custom Tailwind classes.
- **`--color-chart-1` through `--color-chart-5` ([`globals.css:L118-L122`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css#L118-L122)):** Declared as monochrome OKLCH grays but never consumed by Recharts components.

---

## 4. Component Fragmentation & Duplication

The codebase suffers from duplicated implementations of identical UI concepts across different directories:

### 4.1 Pagination Fragmentation (3 Separate Implementations)
1. [`src/components/ui/pagination.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/pagination.tsx): Square/rounded-md shadcn pagination (**0 imports, dead code**).
2. [`src/components/dashboard/shared/pagination.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/shared/pagination.tsx): Client-state circle pagination with `size-9 rounded-full bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_22px_-10px_rgba(43,114,234,0.7)]`.
3. [`src/components/public/landing/courses-pagination.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/courses-pagination.tsx): Next.js Link-based pagination with text labels "Sebelumnya" / "Selanjutnya" and `shadow-[0_10px_24px_-10px_rgba(43,114,234,0.7)]`.

### 4.2 Password Input Fragmentation (3 Separate Implementations)
1. [`src/app/(auth)/_components/form-field.tsx:L76-L102`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/_components/form-field.tsx#L76-L102) (`AuthPasswordInput`): Toggle button positioned at `top-[34px] right-3` with `p-1 rounded-md text-muted-foreground`.
2. [`src/components/admin/users/form/password-input.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/users/form/password-input.tsx) (`PasswordInput`): Toggle button positioned at `absolute inset-y-0 right-0 grid w-11` with `tabIndex={-1}` and `text-zinc-400 hover:text-zinc-700`.
3. [`src/components/dashboard/settings/security-form.tsx:L289-L315`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/settings/security-form.tsx#L289-L315) (`PasswordField`): Inline bespoke toggle with `grid size-8 rounded-lg hover:bg-[color:var(--color-brand-50)]`.

### 4.3 Form Field Wrapper Duplication
- [`src/components/admin/courses/form/field.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/form/field.tsx) vs [`src/components/admin/internship/config/form-field.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/internship/config/form-field.tsx):
  Both components are named `Field`, accept identical props (`label`, `error`, `hint`, `current`, `max`), but have diverging styles (`gap-2` with `text-xs text-red-600 dark:text-red-400` vs `gap-1.5` with `text-[11px] text-red-600` without dark mode).
- Public `/ganti-password` ([`force-password-change-form.tsx:L16-L17`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/account/force-password-change-form.tsx#L16-L17)) cross-imports internal admin course form components (`@/components/admin/courses/form/field` and `@/components/admin/users/form/password-input`).

### 4.4 Class Identity Chip Duplication
- [`src/components/internship/internship-class-chip.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/internship/internship-class-chip.tsx) and [`src/components/mentor/mentor-class-chip.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/mentor-class-chip.tsx) share **95% identical code**, popover DOM, gradient backgrounds, and radial meshes, differing only by icon and row field names.

### 4.5 Empty State Duplication
- [`src/components/internship/internship-empty-state.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/internship/internship-empty-state.tsx) and [`src/components/mentor/mentor-empty-state.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/mentor-empty-state.tsx) are carbon copies of each other, differing only in header strings.

### 4.6 Payment Cancellation Dialog Duplication
- [`src/components/admin/transactions/cancel-payment-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/transactions/cancel-payment-dialog.tsx) and [`src/components/dashboard/transactions/cancel-payment-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/cancel-payment-dialog.tsx) replicate the exact same modal dialog, amber warning badge, and confirmation copy.

### 4.7 Deletion Confirmation Modal Duplication
Instead of reusing [`AdminConfirmDialog`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/admins/admin-confirm-dialog.tsx) or [`ConfirmDialog`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/form/confirm-dialog.tsx), over **8 individual entity delete dialogs** duplicate identical modal structure and styles:
- [`delete-course-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/delete-course-dialog.tsx)
- [`delete-category-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/categories/delete-category-dialog.tsx)
- [`delete-user-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/users/delete-user-dialog.tsx)
- [`delete-voucher-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/vouchers/delete-voucher-dialog.tsx)
- [`delete-config-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/internship/config/delete-config-dialog.tsx)
- [`delete-task-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/tasks/detail/delete-task-dialog.tsx)
- [`delete-transaction-dialog.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/transactions/delete-transaction-dialog.tsx)

---

## 5. Shadow Proliferation & Magic Numbers

An automated AST scan identified **86 distinct, unstandardized arbitrary shadow formulas** across the component tree. Tiny, arbitrary pixel variations exist across otherwise identical components:
- `shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)]`
- `shadow-[0_18px_40px_-18px_rgba(71,142,244,0.65)]`
- `shadow-[0_18px_36px_-16px_rgba(71,142,244,0.8)]`
- `shadow-[0_22px_44px_-18px_rgba(71,142,244,0.75)]`
- `shadow-[0_24px_50px_-20px_rgba(35,65,137,0.35)]`
- `shadow-[0_24px_50px_-26px_rgba(71,142,244,0.45)]`
- `shadow-[0_24px_50px_-28px_rgba(35,65,137,0.35)]`
- `shadow-[0_24px_50px_-30px_rgba(35,65,137,0.35)]`
- `shadow-[0_30px_60px_-30px_rgba(35,65,137,0.45)]`
- `shadow-[0_40px_80px_-40px_rgba(35,65,137,0.55)]`

**Impact:** Without a unified elevation token set (e.g. `--shadow-glow-brand`, `--shadow-glow-accent`, `--shadow-lift-card`), components suffer visual drift and maintenance overhead.

---

## 6. Typography Scale Inconsistencies

1. **Proliferation of Arbitrary Non-Standard Font Sizes:**
   - `text-[11px]` (**243 uses**): Used almost as frequently as `text-xs` (12px), creating two competing micro-caption sizes.
   - `text-[10px]` (**106 uses**): Used for uppercase overlines.
   - `text-[12px]` (**33 uses**): Arbitrary px value bypassing Tailwind's `text-xs`.
   - `text-[15px]` (**18 uses**) & `text-[13px]` (**17 uses**): Arbitrary in-between sizes.
2. **Sub-Pixel / Low-Legibility Font Sizes (Accessibility Hazard):**
   - `text-[7px]` in [`src/app/(auth)/_components/brand-panel.tsx:L235`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/_components/brand-panel.tsx#L235) and [`src/components/public/landing/hero-section.tsx:L303`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/hero-section.tsx#L303)
   - `text-[8px]` in [`src/components/course-player/curriculum-sidebar.tsx:L86`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/curriculum-sidebar.tsx#L86) and [`src/components/dashboard/student-course-card.tsx:L62`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/student-course-card.tsx#L62)
   - `text-[9px]` across 11 files (e.g. [`player-topbar.tsx:L66`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/player-topbar.tsx#L66), [`sprint-group.tsx:L98`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/sprint-group.tsx#L98), [`identity-card.tsx:L120`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/settings/identity-card.tsx#L120)).

---

## 7. Accessibility (a11y) & Contrast Issues

1. **Brand Yellow Low-Contrast on Light Backgrounds:**
   The accent yellow (`--color-brand-accent` / `#f4d600`) has a contrast ratio of only **~1.3:1** against white backgrounds (WCAG AA requires 4.5:1 for regular text and 3:1 for large text).
   - Low contrast text verified in:
     - [`src/components/public/landing/count-up.tsx:L79`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/count-up.tsx#L79): `<span className="text-[color:var(--color-brand-accent)]">{suffix}</span>`
     - [`src/components/public/landing/final-cta-section.tsx:L45`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/landing/final-cta-section.tsx#L45): `<span className="text-[color:var(--color-brand-accent)]">Mulai hari ini.</span>`
     - [`src/components/public/nav-link.tsx:L37`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/public/nav-link.tsx#L37): Yellow text on yellow tint
   - *Contrast Workaround Note:* [`curriculum-sidebar.tsx:L106`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/course-player/curriculum-sidebar.tsx#L106) explicitly hardcoded `text-[#9a8200]` in light mode to fix this, but the pattern was never standardized as a token (e.g. `--color-brand-accent-text-light`).
2. **Sub-Target Touch Targets on Mobile (< 36px / < 44px):**
   28 interactive controls violate the 44x44px minimum touch target guideline without touch expansion padding:
   - `search-box.tsx:L45`: Clear button is `size-6` (24px)
   - `Button size="sm"` across admin tables and forms is `h-7` (28px) ([`admin-grades-table.tsx:L92`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/internship/grades/admin-grades-table.tsx#L92), [`task-form.tsx:L180`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/mentor/tasks/create/task-form.tsx#L180))
   - `Button size="xs"` is `h-6` (24px)
3. **`outline-none` Without Replacement `focus-visible` Ring:**
   Elements suppressing default browser outline without active visible focus state:
   - [`src/components/ui/command.tsx:L100`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/command.tsx#L100): `no-scrollbar ... outline-none`
   - [`src/components/ui/tabs.tsx:L76`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/ui/tabs.tsx#L76): `flex-1 text-sm outline-none`
   - [`src/components/admin/courses/form/course-general-section.tsx:L124,191,219`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/admin/courses/form/course-general-section.tsx#L124): Input fields with bare `outline-none`

---

## 8. Theme Boundary Anomalies

1. **Auth Scope `!important` Warfare:**
   [`src/app/(auth)/auth.css:L56-L105`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/auth.css#L56-L105) uses `!important` on 6 separate declarations (`background-color: var(--color-brand-50) !important; color: #000000 !important;`) to force auth inputs to light mode even if the user has `.dark` set. This directly conflicts with [`form-field.tsx:L45`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/(auth)/_components/form-field.tsx#L45) which passes `bg-white`.
2. **Hardcoded Print / Rasterization Island:**
   [`src/components/dashboard/transactions/invoice-card.tsx`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/components/dashboard/transactions/invoice-card.tsx) intentionally uses 38 raw hex values (`#e4e4e7`, `#225bd7`, `#18181b`, `#71717a`, `#a1a1aa`, `#047857`) because `html-to-image` breaks when encountering OKLCH CSS variables during PNG generation.

---

# PART 3: Token Quick Reference & CSS Declarations

Below is the consolidated token reference reflecting the actual current implementation in [`src/app/globals.css`](file:///d:/NextLevel%20Academy/ta-platform-pembelajaran-digital-nextlevel-academy/src/app/globals.css).

### CSS Custom Properties (`:root` & `.dark`)

```css
:root {
  /* Brand Core Palette */
  --color-brand-50: #eef5ff;
  --color-brand-100: #d8e7fe;
  --color-brand-200: #b8d3fe;
  --color-brand-300: #88b5fc;
  --color-brand-400: #5395f8;
  --color-brand-500: #478ef4;
  --color-brand-600: #2b72ea;
  --color-brand-700: #225bd7;
  --color-brand-800: #234aae;
  --color-brand-900: #234189;
  --color-brand-950: #19295a;

  /* Brand Accents & Status */
  --color-brand-accent: #f4d600;
  --color-brand-accent-soft: #fff4a3;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Light Workspace Surfaces */
  --surface-app: #f7f8fb;
  --surface-nav: #ffffff;
  --surface-card: #ffffff;
  --surface-card-strong: #ffffff;
  --surface-border: #e4e7ec;
  --surface-border-strong: #cdd2db;

  /* Focus Theater (Player) Light */
  --player-stage: #f3f5fa;
  --player-surface: #ffffff;
  --player-surface-strong: #f7f8fb;
  --player-hairline: rgba(15, 23, 42, 0.08);
  --player-hairline-strong: rgba(15, 23, 42, 0.16);
  --player-glow: rgba(71, 142, 244, 0.10);
  --player-glow-soft: rgba(71, 142, 244, 0.04);
  --player-accent: #478ef4;
  --player-accent-yellow: #f4d600;
  --player-dot: rgba(15, 23, 42, 0.06);

  /* Radius Base */
  --radius: 0.625rem; /* 10px */

  /* Fluid Scale */
  --nav-h: 68px;
  --fluid-section-y: clamp(4rem, 2.5rem + 4vw, 7rem);
  --fluid-display: clamp(2.5rem, 2rem + 2.2vw, 4.5rem);
  --fluid-h2: clamp(1.875rem, 1.4rem + 1.6vw, 3rem);
  --fluid-cta-h2: clamp(2.25rem, 1.6rem + 2.2vw, 3.75rem);
  --fluid-lead: clamp(1rem, 0.96rem + 0.55vw, 1.25rem);
}

.dark {
  /* Dark Workspace Surfaces */
  --background: #0b0d12;
  --surface-app: #0b0d12;
  --surface-nav: #14171f;
  --surface-card: #1c2030;
  --surface-card-strong: #262b3e;
  --surface-border: #2a2f3d;
  --surface-border-strong: #3a4055;

  /* Focus Theater (Player) Dark */
  --player-stage: #08090d;
  --player-surface: #11141c;
  --player-surface-strong: #181c28;
  --player-hairline: rgba(255, 255, 255, 0.06);
  --player-hairline-strong: rgba(255, 255, 255, 0.12);
  --player-glow: rgba(71, 142, 244, 0.18);
  --player-glow-soft: rgba(71, 142, 244, 0.06);
  --player-accent: #5395f8;
  --player-accent-yellow: #f4d600;
  --player-dot: rgba(255, 255, 255, 0.05);
}
```

### Tailwind v4 `@theme inline` Definition

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-poppins);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-poppins);

  --color-brand-50: #eef5ff;
  --color-brand-100: #d8e7fe;
  --color-brand-200: #b8d3fe;
  --color-brand-300: #88b5fc;
  --color-brand-400: #5395f8;
  --color-brand-500: #478ef4;
  --color-brand-600: #2b72ea;
  --color-brand-700: #225bd7;
  --color-brand-800: #234aae;
  --color-brand-900: #234189;
  --color-brand-950: #19295a;

  --color-brand-accent: #f4d600;
  --color-brand-accent-soft: #fff4a3;

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  --color-surface-app: var(--surface-app);
  --color-surface-nav: var(--surface-nav);
  --color-surface-card: var(--surface-card);
  --color-surface-card-strong: var(--surface-card-strong);
  --color-surface-border: var(--surface-border);
  --color-surface-border-strong: var(--surface-border-strong);

  --radius-sm: calc(var(--radius) * 0.6);  /* 6px */
  --radius-md: calc(var(--radius) * 0.8);  /* 8px */
  --radius-lg: var(--radius);              /* 10px */
  --radius-xl: calc(var(--radius) * 1.4);  /* 14px */
  --radius-2xl: calc(var(--radius) * 1.8); /* 18px */
  --radius-3xl: calc(var(--radius) * 2.2); /* 22px */
  --radius-4xl: calc(var(--radius) * 2.6); /* 26px */
}
```
