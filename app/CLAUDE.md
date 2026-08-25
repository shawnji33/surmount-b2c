@AGENTS.md

## Overview

This is the **Surmount B2C** app — a retail-investing prototype for consumers. The user flow is **login → onboarding (KYC + strategy quiz + funding) → dashboard**. There is **no backend**: every screen is rendered from mock data or local state, so this repo is primarily a high-fidelity, interactive design prototype rather than a production service.

For brand, design-system tokens, and the absolute UI rules (no ALL CAPS, no hardcoded hex/px, Geist body / Inter display, Bloomberg-terminal data density), read the master reference at `~/Surmount/CLAUDE.md`. This file describes **the app itself**.

## Build & Run

Next.js 16 app (React 19). Uses **npm** (`package-lock.json`). Dev server runs at http://localhost:3000.

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Start dev server (hot reload) | `npm run dev` |
| Production build | `npm run build` |
| Run production build | `npm run start` |

## Testing

No unit/integration test runner is configured yet (no jest, vitest, playwright, or cypress; no `test` script in `package.json`). Verify changes with the type checker and a production build:

| Task | Command |
|---|---|
| Type-check (no emit) | `npx tsc --noEmit` |
| Design-system conformance | `npm run ds:check` (must PASS) |
| Production build (catches type + build errors) | `npm run build` |

`tsconfig.json` runs in `strict` mode, so `npx tsc --noEmit` is the fast pre-commit check; `npm run build` is the full verification.

**Never run `npm run build` while `npm run dev` is running** — they share `.next`, and the build clobbers the dev server's state, leaving every route returning `Internal Server Error` until dev is restarted. Stop dev first, or verify against the running dev server instead.

## Architecture

- **App Router** (`src/app/`). Each route is a folder with `page.tsx` (and optional `layout.tsx`). Interactive pages are Client Components (`'use client'`); the prototype has no server actions or route handlers.
- **Root layout** (`src/app/layout.tsx`) loads the two fonts via `next/font/google` — **Geist** (`--font-geist`, body) and **Inter** (`--font-inter`, display) — and mounts `<FigmaCaptureLoader />` globally.
- **Path alias**: import from `@/*` → `./src/*` (configured in `tsconfig.json`). Prefer this over deep relative paths.
- **Home shell**: `src/app/home/HomeShell.tsx` (client) wraps dashboard pages with the `Sidebar` + content area, and hides the sidebar on the `/home/agents` surface via `usePathname()`.

## Routing surfaces

- **`/`** → `LoginPage`.
- **`/dev`** → **developer route index** — a hand-maintained list of links to every page in the app. This is the canonical map; check here first when looking for a screen, and add new prototype pages to it.
- **`/onboarding/*`** → ~50 single-step pages grouped into identity/KYC, financial profile, strategy quiz, and funding. Shared local building blocks live in `src/app/onboarding/_components/` (`DSInput`, `DSDropdown`, `DSDatePicker`, `Brand`, `OnboardingFlow`).
- **`/home`** → investing dashboard. Sub-surfaces:
  - `home/saving` (HYCA), `home/saving/settings`, `home/saving/empty`
  - `home/strategy/[id]` (strategy detail)
  - `home/agents/*` — agent builder (`canvas`, `build`, `simulation`, `timeline`, `cards`), uses `@xyflow/react` for the node canvas; rendered without the sidebar.
  - `home/playground/*` — account-selection design explorations.
- **`/activity`** → activity / orders feed.
- **`/strategy-result`**, **`/b2b`** → standalone screens.

## Styling & design system

- **Tailwind v4** (`@tailwindcss/postcss`, configured in `postcss.config.mjs`) **+ CSS Modules** co-located per component as `Name.module.css`. Most components combine both: Tailwind utilities for layout, a module for bespoke styling.
- **shadcn/ui** is the component layer, ported into `src/components/ui/` (`button`, `select`, `avatar` so far). Port from `~/Surmount/design-system-surmount/components/ui/` rather than running `shadcn add` cold — that repo's versions are already reconciled with Surmount tokens. Substitute Phosphor icons for lucide. Its Tailwind classes are already on-scale (Tailwind's spacing is 4px-based with `.5` steps at 2px; `text-sm`/`text-xs` = 14/12px), so they need no numeric adjustment.
- **Tokens**: `src/styles/tokens.css` holds the design-system variables and is **auto-generated — never hand-edit it**. It is imported by `src/app/globals.css`.
- **Product roles**: `src/styles/product-roles.css` composes canonical primitives into recurring Surmount patterns (type hierarchy, guided-flow geometry, quiet surfaces, and motion feedback). It must not redefine primitives or become a second token authority.
- **`@theme inline` gotcha**: `globals.css` re-declares Tailwind utility variables (radius, font-weight) inside `@theme inline` with literal DS values. This is intentional — without it, `tokens.css` (`:root`, specificity 1) would silently override Tailwind's `:where(:root)` defaults. If you add a Tailwind utility whose `--variable` name also appears in `tokens.css`, pin it in `@theme inline`. The rationale is documented at the top of `globals.css`.
- **Cascade layers**: any *unlayered* rule beats *every* layered rule regardless of specificity, so a bare global reset silently defeats all of Tailwind's `@layer utilities`. `globals.css`'s `* { padding: 0; margin: 0 }` reset lives inside `@layer base` for exactly this reason — this already cost one round of debugging where every ported shadcn component rendered with zero padding. Keep new global resets in `@layer base`.
- **`--primary` / `--secondary` collision**: `globals.css` maps `--color-primary`/`--color-secondary` to legacy UUI values that 14 files depend on, so `shadcn-bridge.css` deliberately does *not* expose its own `--primary`/`--secondary` as Tailwind theme keys. In ported components use `bg-[var(--primary)]`, never `bg-primary`. Full rationale at the top of `src/styles/shadcn-bridge.css`.
- Follow the master CLAUDE.md hard rules: tokens via `var(--*)` (no raw hex/px), Geist for UI / Inter for display, and **never** ALL CAPS or `text-transform: uppercase`.

### Numeric scales — enforced, not aspirational

Every px value must land on a scale. **Odd or decimal px is a bug.** Full table in `~/Surmount/CLAUDE.md` § "Numeric scales"; the short version:

- **Spacing** (padding/margin/gap/offsets/sizes) — always a multiple of 2. Prefer `var(--spacing-*)`.
- **Font size** — only 10 · 12 · 14 · 16 · 18 · 20 · 24 · 30 · 36 · 48 · 60 · 72. No 13px, no 15px, no 11px.
- **Border radius** — only 2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · full.
- **Exempt** (px encodes a look, not a step): `box-shadow` blur/spread, `filter: blur()`, `transform` distances, `outline-offset`, `stroke-width`, `letter-spacing`, animation travel. `border-width: 1px` is correct; `1.5px`/`0.5px` are not.

`npm run ds:check` enforces this across every `*.module.css` and `globals.css`, and exits non-zero on any violation. `npm run ds:fix` applies the fixes. **Run it before calling any UI work done** — the whole app was normalized on 10 Aug 2026 (813 fixes / 71 files) and the point is to keep it at zero. The checker also prints an *advisory* list of even-but-off-scale font sizes and radii (32px, 22px radius, …); those are compliant with the multiple-of-2 rule and are Shawn's call — do not silently snap them.

## Key files & directories

| Path | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout — fonts, global CSS, FigmaCaptureLoader |
| `src/app/globals.css` | Global styles, Tailwind import, `@theme inline` token pinning |
| `src/styles/tokens.css` | Auto-generated design-system tokens (do not edit) |
| `src/styles/product-roles.css` | Composed Surmount product roles built from canonical tokens |
| `src/styles/shadcn-bridge.css` | Maps canonical tokens to shadcn semantic roles |
| `src/styles/DESIGN_SYSTEM.md` | Design-system architecture and product-pattern contract |
| `src/app/dev/page.tsx` | Route index for every page |
| `src/app/home/HomeShell.tsx` | Dashboard shell + sidebar visibility logic |
| `src/app/onboarding/_components/` | Onboarding-local DS inputs (`DSInput`, `DSDropdown`, `DSDatePicker`, `Brand`, `OnboardingFlow`) |
| `src/components/` | Shared UI: `Sidebar`, `Button`, `Input`, `Checkbox`, `AccountSelectorCard`, `LoginPage`, `StrategyResult`, `FigmaCaptureLoader` |
| `src/components/charts/` | Charts (lightweight-charts + recharts) |
| `src/components/chat/` | Chat UI (assistant-ui) — bubbles, loaders, typewriter |
| `src/lib/mock-activity.ts` | Mock data source (stands in for an API) |
| `src/hooks/usePendingActivity.ts` | Reads mock activity, derives pending count |
| `src/types/activity.ts` | Shared activity/order types + status guards |
| `src/utils/cx.ts` | `cx()` className helper (`clsx` + `tailwind-merge`) |

## Conventions

- Add `'use client'` to any page/component with hooks, state, or event handlers.
- Co-locate styles as `Name.module.css` next to the component; merge classNames with `cx(...)` from `@/utils/cx`.
- Icons come from `@phosphor-icons/react`.
- **Motion**: follow the Surmount pattern in `AGENTS.md` — keep persistent containers mounted and animate the measured height + inner opacity/shift on state change; don't remount whole cards. Respect `prefers-reduced-motion`.
- Data is mock-only: feed new screens from `src/lib/` and `src/hooks/`, not from network calls.

## Notable dependencies

| Package | Used for |
|---|---|
| `@phosphor-icons/react` | Icon set |
| `@xyflow/react` | Node canvas for the agent builder (`/home/agents`) |
| `lightweight-charts`, `recharts` | Financial / dashboard charts |
| `react-aria-components` | Accessible interactive primitives |
| `class-variance-authority` | Variant-based component styling |
| `clsx`, `tailwind-merge` | className composition (wrapped by `cx()`) |
| `@assistant-ui/react` | Chat primitives |
