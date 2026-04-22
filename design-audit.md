# Surmount B2C — Design Consistency Audit

> Last updated: 2026-04-21. Source of truth for interaction, visual, and copy patterns across all B2C prototypes. Every new screen should match this spec before it ships.

---

## 1. Token System

### Problem: three conflicting systems in use

| System | Files | Style |
|---|---|---|
| **A — Old full system** | `homepage.html`, `strategy-detail.html` | `--color-surface-default`, `--color-text-primary`, `--space-*`, `--text-xs/sm/md`, `--font-weight-*` |
| **B — Shorthand mix** | `marketplace.html`, `dividends.html` | `--font-display`, `--font-body`, `--color-surface`, raw px values |
| **C — Fully custom** | `invest.html` | `--b600`, `--b700`, `--text-primary`, `--border-default`, `--surface-bg` |

### Canonical token set (use these everywhere going forward)

```css
/* Backgrounds */
--color-bg-primary            /* #FFFFFF */
--color-bg-secondary          /* #FAFAFA */

/* Text / foreground */
--color-fg-primary-900        /* #181D27 */
--color-fg-secondary-700      /* #414651 */
--color-fg-tertiary-600       /* #717680 */

/* Borders */
--color-border-primary        /* rgba(0,0,0,0.09) — card borders */
--color-border-secondary      /* rgba(0,0,0,0.06) — table row dividers */

/* Brand */
--color-brand-600             /* #406AD0 — primary CTA */
--color-bg-brand-solid-hover  /* #3757BE — hover on brand CTA */
--color-brand-50              /* #EEF3FC — brand tints, badge bg */

/* Financial semantic */
--color-utility-success-700   /* #316434 — positive returns */
--color-utility-error-700     /* #98443D — negative returns */

/* Typography */
--font-family-display         /* 'Inter', sans-serif */
--font-family-body            /* 'Geist', system-ui, sans-serif */

/* Font sizes */
--font-size-text-xs    /* 12px */
--font-size-text-sm    /* 14px */
--font-size-text-md    /* 16px */
--font-size-text-lg    /* 18px */
--font-size-text-xl    /* 20px */
--font-size-display-xs /* 24px */

/* Spacing */
--spacing-xs   /*  4px */
--spacing-sm   /*  6px */
--spacing-md   /*  8px */
--spacing-lg   /* 12px */
--spacing-xl   /* 16px */
--spacing-2xl  /* 20px */
--spacing-3xl  /* 24px */
--spacing-4xl  /* 32px */
--spacing-5xl  /* 40px */

/* Border radius */
--radius-xs    /*   4px */
--radius-sm    /*   6px */
--radius-md    /*   8px */
--radius-lg    /*  10px */
--radius-xl    /*  12px */
--radius-2xl   /*  16px */
--radius-full  /* 9999px */
```

**Rule: never hardcode any hex, px, or rgba value that has a token equivalent.**

---

## 2. Typography

### Font families

| Use case | Font | Token |
|---|---|---|
| All UI body text (90%+ of product) | Geist | `var(--font-family-body)` |
| Headings, page titles, display numbers | Inter | `var(--font-family-display)` |
| Serif | — | Do not introduce; removed from canon |

### Font weights — 400 and 500 only

**Absolute rule. No 600, no 700, no bold.**

Current violations that need fixing:

| File | Violation |
|---|---|
| `marketplace.html` | `page-title` (600), `cat-label` (700), `strategy-cover-name` (600), `manager-avatar-initials` (600) |
| `dividends.html` | `metric-value` (600) |
| `invest.html` | `amount-display` (600), `amount-chip` (600), `av-sm` (700) |
| `homepage.html` | `account-avatar` overflow text (600), `ticker-logo` initials (600) |

Replace all `font-weight:600` → `font-weight:500` and `font-weight:700` → `font-weight:500`.

### Font size scale — approved sizes only

| Token | Value | Use |
|---|---|---|
| `--font-size-text-xs` | 12px | Table headers, labels, metadata, badges |
| `--font-size-text-sm` | 14px | Body text, table cells, buttons (default) |
| `--font-size-text-md` | 16px | Search inputs, large body, button CTA |
| `--font-size-text-lg` | 18px | Section headings |
| `--font-size-text-xl` | 20px | Page section titles |
| `--font-size-display-xs` | 24px | Page titles |

Exception: display KPI numbers (portfolio value, metric card) may use 28px with Inter + weight 400–500.

Do not use: 11px, 13px, 32px, 36px, 40px, 64px — these appear in current files and need normalizing.

### Letter spacing

- Body global: `-0.5px` — set on `body` in homepage/strategy-detail; **missing from marketplace, dividends, invest** → add to all.
- Display numbers: `-0.75px`
- Page titles: `-0.3px`
- **Never use positive letter spacing.** `0.64px` on marketplace category card labels (`cat-label`) violates this — remove.

### Line heights

- 12px text → 18px line-height
- 14px text → 20px line-height
- 16px text → 24px line-height

---

## 3. Color — Key Inconsistencies

### `--color-border-default` defined differently across files

| File | Value |
|---|---|
| `homepage.html`, `strategy-detail.html`, `invest.html` | `rgba(0,0,0,0.06)` |
| `marketplace.html`, `dividends.html` | `#E9EAEB` (raw hex) |
| `dividends.html` cards, `strategy-detail.html` some cards | `rgba(0,0,0,0.09)` |

**Canonical:**
- Card/container borders: `rgba(0,0,0,0.09)` → `--color-border-primary`
- Table row dividers, subtle lines: `rgba(0,0,0,0.06)` → `--color-border-secondary`
- Never use `#E9EAEB` as a border token — that's a raw gray value.

### Success green — two different greens in use

| Value | Token | Use |
|---|---|---|
| `#316434` | `--color-utility-success-700` | Return text, badge text ✓ |
| `#3B7E3F` | chart-specific | Chart line color only (acceptable exception) |
| `#16A34A` | — | **Remove** — appears in marketplace/dividends as success dot |

Canonical success palette:
- Text: `#316434`
- Badge background: `#EEF7EE`
- Badge border: `#CBE7CC`
- Dot/indicator: `#316434` (not `#16A34A`)

### Font token name conflicts

| Wrong (in use) | Right |
|---|---|
| `var(--font-display)` | `var(--font-family-display)` |
| `var(--font-body)` | `var(--font-family-body)` |

marketplace.html and dividends.html both use the shorthand form — fix.

---

## 4. Border Radius — Critical Inconsistency

### `--radius-lg` is defined differently across files

| File | `--radius-lg` |
|---|---|
| `homepage.html`, `strategy-detail.html` | `10px` ✓ |
| `marketplace.html`, `dividends.html` | `12px` ✗ |

**Canonical: `--radius-lg` = `10px`** (stat pills, smaller containers). Cards use `--radius-xl` = 12px.

### Hardcoded radius values found — replace with tokens

Files with raw px values: `dividends.html` (10px, 12px, 16px), `marketplace.html` (8px, 12px), `invest.html` (10px, 12px, border-radius:10px on chips and freq-pill).

| Raw value | Use token |
|---|---|
| `4px` | `--radius-xs` |
| `6px` | `--radius-sm` |
| `8px` | `--radius-md` |
| `10px` | `--radius-lg` |
| `12px` | `--radius-xl` |
| `16px` | `--radius-2xl` |
| `9999px` | `--radius-full` |

---

## 5. Shadows

### Canonical shadow set — use only these five

| Name | Value | Use |
|---|---|---|
| `--shadow-xs` | `0px 1px 2px rgba(10,13,18,0.05)` | Small buttons, icon buttons |
| `--shadow-card` | `0px 2px 12px rgba(10,13,18,0.03)` | Cards, dropdowns, search box |
| Time-btn active | `0px 1px 3px rgba(10,13,18,0.08), 0 0 0 0.5px rgba(10,13,18,0.06)` | Pill-in-pill active state |
| Toast / floating | `0 4px 24px rgba(10,13,18,0.12), 0 0 0 1px rgba(0,0,0,0.04)` | Toasts, popovers |
| Modal | `0 8px 40px rgba(10,13,18,0.18), 0 0 0 1px rgba(10,13,18,0.06)` | Modals, large overlays |

---

## 6. Hover Effects

### Clickable table rows / list items

```css
transition: background 120ms ease;
/* hover: */
background: var(--color-bg-secondary);  /* #FAFAFA */
```

Icon inside row scales on hover:
```css
.row-icon {
  transition: box-shadow 150ms ease, transform 150ms ease;
}
.row:hover .row-icon {
  transform: scale(1.04);
  box-shadow: 0px 2px 6px rgba(10,13,18,0.12);
}
```

Apply this to: strategy icons, ticker logos, broker logos — every table row that has an avatar/icon.

### Clickable cards (navigate on click)

```css
cursor: pointer;
transition: border-color 120ms ease;
text-decoration: none; color: inherit;
/* hover: */
border-color: rgba(0,0,0,0.14);
```

Optional on card grids only: also set `background: var(--color-bg-secondary)` on hover.

### Text links / action links

```css
transition: color 150ms ease;
/* hover: tertiary → secondary */
color: var(--color-fg-secondary-700);
```

### Dropdown pills / filter selects

```css
transition: background 150ms ease, border-color 150ms ease;
/* hover: */
background: var(--color-bg-secondary);
```

### Search / filter input focus

```css
transition: border-color 150ms ease, box-shadow 150ms ease;
/* focus-within: */
border-color: var(--color-brand-600);
```

Currently `marketplace.html` has `focus-within` on filter-search — apply to all search inputs.

### Back navigation — animated chevron pattern

This is the canonical back nav. Use it on all pages with back navigation (currently missing from `invest.html`):

```css
.nav-back-btn {
  padding: 10px 12px 10px 0;
  transition: color 200ms ease, padding-left 200ms ease, background 200ms ease;
}
.nav-back-btn:hover {
  color: rgba(10,13,18,0.9);
  padding-left: 12px;
  background: #F5F5F5;
  border-radius: var(--radius-md);
}
/* Chevron expands from zero width */
.nav-back-chevron {
  width: 0; height: 18px; overflow: hidden; opacity: 0;
  transition: width 200ms ease, opacity 200ms ease;
}
.nav-back-btn:hover .nav-back-chevron { width: 18px; opacity: 1; }
/* Active: */
.nav-back-btn:active { transform: scale(0.97); }
```

---

## 7. Active / Pressed States

**Canonical: `transform: scale(0.97)` at `transition: transform 100ms ease`.**

Apply to all clickable elements that are not row-hover patterns.

### Current inconsistencies to fix

| Element | Current | Fix |
|---|---|---|
| `carousel-btn` | `scale(0.93)` | → `scale(0.97)` |
| Amount chips (`invest.html`) | `scale(0.95)` at 80ms | → `scale(0.97)` at 100ms |
| `review-btn` / primary CTA | none | Add `scale(0.97)` |
| `btn-secondary`, `btn-icon` | `scale(0.97)` ✓ | Keep |
| Back nav | `scale(0.97)` ✓ | Keep |

---

## 8. Transition Speed Reference

Only use these speeds. No arbitrary durations.

| Speed | When |
|---|---|
| `100ms ease` | Press/active transform (`:active` scale) |
| `120ms ease` | Table row hover background |
| `150ms ease` | Button hover (bg, border, shadow), card hover, link color |
| `200ms ease` | Back nav expansion, tab color, slow UI state changes |
| `220ms cubic-bezier(0.16,1,0.3,1)` | Modal entry |
| `320ms cubic-bezier(.34,1.4,.64,1)` | Spring scale-in (donut, chart reveal) |
| `520ms cubic-bezier(0.16,1,0.3,1)` | Full page entry animation |
| `600ms cubic-bezier(.25,1,.5,1)` | Progress bar fill (deferred/async) |
| `1.6s linear infinite` | Skeleton shimmer |

---

## 9. Buttons

### Hierarchy and states

| Variant | Base bg | Border | Text | Hover bg |
|---|---|---|---|---|
| **Primary** | `--color-brand-600` | `rgba(255,255,255,0.12)` 2px inner | `#fff` | `--color-bg-brand-solid-hover` |
| **Secondary** | `#fff` | `rgba(0,0,0,0.09)` 1px | `rgba(10,13,18,0.7)` | `--color-bg-secondary` |
| **Tertiary / ghost** | `transparent` | `transparent` | `rgba(10,13,18,0.7)` | `--color-bg-secondary` |
| **Icon-only** | `#fff` or transparent | `rgba(0,0,0,0.09)` | icon | `--color-bg-secondary` |
| **Disabled** | `--color-bg-secondary` | `#E9EAEB` | `#A4A7AE` | — |

All buttons:
- `border-radius: var(--radius-md)` (8px)
- `font-weight: 500`
- `font-family: var(--font-family-body)`
- hover transition: `150ms ease`
- active: `transform: scale(0.97)` at `100ms ease`

### Size scale

| Size | Height | Padding | Font |
|---|---|---|---|
| xs | 34px | 8px 10px | 12px |
| sm | 36px | 8px 12px | 14px |
| **md (default)** | 40px | 10px 14px | 14px |
| lg | 44px | 11px 16px | 14px |
| xl | 48px | 12px 18px | 16px |

### Icon button (square)

```css
width: 32px; height: 32px;
display: flex; align-items: center; justify-content: center;
border-radius: var(--radius-sm);
background: transparent; border: none;
color: var(--color-fg-tertiary-600);
transition: background 120ms ease, color 120ms ease;
/* hover: */
background: var(--color-border-secondary); /* rgba(0,0,0,0.06) light fill */
color: var(--color-fg-primary-900);
```

---

## 10. Badges & Tags

### Status badges (pill shape — radius-full)

```css
/* Shared */
display: inline-flex; align-items: center;
padding: 2px 8px; border-radius: var(--radius-full);
font-size: 12px; font-weight: 500; white-space: nowrap;

/* Complete / success */
background: #EEF7EE; border: 1px solid #CBE7CC; color: #316434;

/* In progress / brand */
background: var(--color-brand-50); border: 1px solid #C8DBF5; color: #3757BE;

/* Warning / orange (dividend rules — Cash) */
background: #FEF7EE; border: 1px solid #F9D7AF; color: #B84416;

/* Error / sell */
background: #FBF5F5; border: 1px solid #F3D7D5; color: #98443D;
```

### Transaction type badges (square-ish — radius-sm)

Same as status but `border-radius: var(--radius-sm)` (6px):

```css
/* Buy */  background: #EEF7EE; border: 1px solid #CBE7CC; color: #316434;
/* Sell */ background: #FBF5F5; border: 1px solid #F3D7D5; color: #98443D;
```

### Dividend rule chips

```css
/* DRIP */     background: #EEF7EE; border-color: #CBE7CC; color: #316434;
/* Cash */     background: #FEF7EE; border-color: #F9D7AF; color: #B84416;
/* Strategy */ background: #F1F6FD; border-color: #C8DBF5; color: #3757BE;
/* Custom */   background: #FAFAFA; border-color: #E9EAEB; color: #414651;
```

### Category / manager tags

```css
background: var(--color-bg-secondary);
border: 1px solid rgba(0,0,0,0.06);
border-radius: var(--radius-full);
padding: 2px 10px;
font-size: 12px; color: rgba(10,13,18,0.7);
```

---

## 11. Cards

### Standard data card

```css
background: var(--color-bg-primary);
border: 1px solid rgba(0,0,0,0.09);   /* --color-border-primary */
border-radius: var(--radius-xl);       /* 12px */
box-shadow: var(--shadow-card);
padding: var(--spacing-2xl);           /* 20px */
```

### Clickable card

Same + cursor and transition:
```css
cursor: pointer;
transition: border-color 120ms ease;
text-decoration: none; color: inherit;
/* hover: */
border-color: rgba(0,0,0,0.14);
```

### Table / list container (no shadow)

```css
background: var(--color-bg-primary);
border: 1px solid rgba(0,0,0,0.09);
border-radius: var(--radius-xl);
overflow: hidden;
/* no box-shadow */
```

### Table header row

```css
background: var(--color-bg-secondary);
border-bottom: 1px solid rgba(0,0,0,0.06);
height: 40px;
font-size: 12px; font-weight: 500; color: var(--color-fg-tertiary-600);
padding: 12px 20px;
white-space: nowrap;
```

### Metric / KPI card (brand tint variant)

```css
/* Standard */
background: var(--color-bg-primary);
border: 1px solid rgba(0,0,0,0.09);
border-radius: var(--radius-lg);   /* 10px — smaller than data cards */
padding: 20px;
box-shadow: var(--shadow-card);

/* Brand tint */
background: linear-gradient(135deg, #EEF3FC 0%, #DCE8F8 100%);
border-color: #C8DBF5;
```

---

## 12. Tables

### Row heights

| Content | Height |
|---|---|
| Single-line | 54px |
| Icon + text + subtext | 60–64px |
| Avatar + 2 data lines | 70px |

### Financial values — always

```css
font-variant-numeric: tabular-nums;
white-space: nowrap;
```

Positive return: `color: var(--color-utility-success-700)` + `font-weight: 500`
Negative return: `color: var(--color-utility-error-700)` + `font-weight: 500`

---

## 13. Forms & Inputs

### Text inputs

```css
height: 40px;
padding: 8px 12px;
border: 1px solid rgba(0,0,0,0.09);
border-radius: var(--radius-md);
background: var(--color-bg-primary);
font-family: var(--font-family-body);
font-size: 14px; font-weight: 400;
color: var(--color-fg-primary-900);
transition: border-color 150ms ease, box-shadow 150ms ease;

/* focus: */
border-color: var(--color-brand-600);
outline: none;
```

### Toggle switch

```css
width: 44px; height: 24px; border-radius: var(--radius-full);
background: var(--color-bg-secondary);  /* off */
transition: background 220ms;
/* on: */ background: var(--color-brand-600);

.knob {
  width: 20px; height: 20px; border-radius: 50%; background: #fff;
  box-shadow: 0px 1px 3px rgba(10,13,18,0.1), 0px 1px 2px -1px rgba(10,13,18,0.1);
  transition: transform 200ms cubic-bezier(0.4,0,0.2,1);
}
/* on: */ transform: translateX(20px);
```

### Amount input (large display — invest page)

```css
font-family: var(--font-family-display);
font-size: 64px; font-weight: 500;
letter-spacing: -2px;
color: rgba(10,13,18,0.4);  /* empty/placeholder */
/* has-value: */ color: var(--color-fg-primary-900);
caret-color: var(--color-brand-600);
background: transparent; border: none; outline: none;
```

---

## 14. Navigation

### Sidebar

```
Width: 100px | Padding: 32px 28px 24px
Background: transparent | z-index: 300
```

Nav button: 32×32px, `--radius-md`, `--color-bg-secondary` bg on active/hover.
Tooltip: opacity + translateX, 150ms, dark bg `#181D27`, 11px Geist, 6px radius.
Avatar: 32×32px circle, `rgba(123,120,214,0.2)` halo on hover.
Active nav items after this audit: Home · Marketplace · Strategy Builder.

### Tab navigation (underline style)

```css
/* Container */
display: flex; border-bottom: 1px solid rgba(0,0,0,0.06);

/* Tab button */
background: none; border: none;
padding: 0 2px 10px; margin-right: 20px;
font-size: 14px; font-weight: 500;
color: var(--color-fg-tertiary-600);  /* inactive */
transition: color 120ms;
cursor: pointer;

/* Active indicator */
.tab.active { color: var(--color-fg-primary-900); }
.tab.active::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 2px; background: var(--color-fg-primary-900);
  border-radius: 2px 2px 0 0;
}
```

---

## 15. Page Layouts

### Dashboard layout (homepage, strategy-detail)

```
[Sidebar 100px] + [Main flex:1]
  → [Page header 76px]
  → [Content area: left-column flex:1 | right-column 400px]
  Columns gap: 40px. Both columns: hidden scrollbar.
```

### Focused / form layout (invest, create flows)

```
[Sidebar 100px] + [Page: overflow-y auto, centered]
  → [Container max-width:480px]
  Entry: page-slide-up 520ms cubic-bezier(0.16,1,0.3,1) 60ms
```

### Full-page scrollable (marketplace, dividends)

```
[Sidebar 100px] + [Main flex:1]
  → [Page header with sticky tabs]
  → [Scrollable content: 6px visible scrollbar]
```

### Scrollbar styles

- Dashboard columns: hidden (`scrollbar-width: none` + `::-webkit-scrollbar{display:none}`)
- Full-page scrollable areas: visible, 6px width, `--color-border-secondary` thumb, transparent track

---

## 16. Entry Animations

### Full-page slide-up (focused flows)

```css
@keyframes page-slide-up {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-container {
  opacity: 0;
  animation: page-slide-up 520ms cubic-bezier(0.16,1,0.3,1) 60ms forwards;
}
```

Use on: all invest/create/form pages. Missing from marketplace and dividends — add.

### Staggered section reveal (multi-section pages)

```css
@keyframes pageSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.section:nth-child(1) { animation: pageSlideIn 200ms cubic-bezier(0.16,1,0.3,1) 0ms both; }
.section:nth-child(2) { animation: pageSlideIn 200ms cubic-bezier(0.16,1,0.3,1) 40ms both; }
/* +40ms per child */
```

### Data panel reveal (async load)

```css
@keyframes bdFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Stagger: 30ms, 90ms, 140ms, 190ms per item */
```

### Spring scale-in (charts, donuts)

```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}
/* 320ms cubic-bezier(.34,1.4,.64,1) — slight spring overshoot */
```

### Reduced-motion (required on every page)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

This block is present in `homepage.html` and `strategy-detail.html` but **missing from marketplace, dividends, invest**. Add to all pages.

---

## 17. Toasts

Canonical spec (source: `dividends.html`):

```css
position: fixed; bottom: 32px; left: 50%;
transform: translateX(-50%) translateY(12px);
background: var(--color-bg-primary);
border: 1px solid rgba(0,0,0,0.09);
border-radius: var(--radius-lg);  /* 10px */
box-shadow: 0 4px 24px rgba(10,13,18,0.12), 0 0 0 1px rgba(0,0,0,0.04);
padding: 12px 16px;
font-size: 14px; font-weight: 500;
opacity: 0; z-index: 2000;
transition: opacity 200ms ease, transform 200ms ease;

.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.hide { opacity: 0; transform: translateX(-50%) translateY(8px); }
```

Toast icon: 20×20px circle, `#EEF7EE` bg, `#CBE7CC` border, `#316434` checkmark.

---

## 18. Empty States

Canonical pattern:

```css
/* Container */
background: var(--color-bg-secondary);
border: 1px dashed rgba(0,0,0,0.09);
border-radius: var(--radius-xl);
display: flex; flex-direction: column; align-items: center;
justify-content: center; gap: 12px;
padding: 48px; text-align: center;

/* Icon circle */
width: 48px; height: 48px; border-radius: 50%;
background: #F5F5F5; border: 1px solid rgba(0,0,0,0.06);
color: var(--color-fg-tertiary-600);

/* Title */ font-size: 16px; font-weight: 500; color: rgba(10,13,18,0.7);
/* Sub */   font-size: 14px; color: rgba(10,13,18,0.6);
```

---

## 19. Copy & Language

### Tone

- Sentence case throughout — no title case for section headers, labels, or badge text
- Actionable over explanatory: "Connect accounts" not "You have no accounts connected"
- Concise: labels are 1–3 words max
- Numbers: commas, 2 decimal places, `$` prefix, tabular numerals

### Case rules

| Element | Case |
|---|---|
| Section titles | Sentence case: "Portfolio", "Recent activities" |
| Table column headers | Sentence case: "Date", "Activity", "Status" |
| Button labels | Sentence case: "Connect accounts", "View all", "Edit" |
| Tab labels | Title case acceptable: "Strategies", "Managers" |
| Badge/tag text | Sentence case: "In progress", "Complete", "DRIP" |
| Acronyms | All caps acceptable: AUM, ETF, AI |

### Current issue to fix

- "In Progress" → "In progress" (sentence case)

### Date formats

- Short: `May 5`, `May 4`
- Long: `May 5, 2026`
- Never: `05/05/26` or ISO format in UI

### Financial formatting

- Positive: `+$256.25 (+12.45%)`
- Negative: `-$256.25 (-12.45%)`
- Large numbers: `$234,984,486.24`

---

## 20. Icons

- Source: Phosphor Icons — `github.com/iota-uz/icons`
- Default style: DuoTone
- Default color: `#414651` (`--color-fg-secondary-700`)
- viewBox: `0 0 256 256`
- Sizes: 16px (standard), 18px (nav), 20px (header/prominent) — never odd sizes

Current inline SVGs with `0 0 16 16` viewBoxes are acceptable for prototypes. Migrate to Phosphor in production.

---

## 21. Priority Fix List

### Critical — do before building anything new

1. **Font weight audit** — find/replace all `font-weight:600/700` → `500` across all files
2. **Add `letter-spacing:-0.5px` to `body`** in marketplace.html, dividends.html, invest.html
3. **Migrate invest.html tokens** — replace `--b600`, `--border-default`, `--text-primary` etc. with canonical tokens
4. **Fix `--radius-lg`** — must be `10px` in marketplace.html and dividends.html (currently `12px`)
5. **Add `prefers-reduced-motion`** to marketplace.html, dividends.html, invest.html

### High — visible inconsistency

6. **Replace `#E9EAEB` border values** in marketplace/dividends with `rgba(0,0,0,0.09)` token
7. **Fix font token names** in marketplace/dividends: `--font-display` → `--font-family-display`
8. **Apply animated chevron back-nav** to invest.html (currently uses simple color transition only)
9. **Normalize press states** — carousel `scale(0.93)` → `0.97`; chips `scale(0.95)/80ms` → `0.97/100ms`
10. **Remove `#16A34A`** from marketplace/dividends success dots → use `#316434`
11. **Remove positive letter-spacing** on marketplace `cat-label` (`letter-spacing:0.64px`)

### Medium — polish pass

12. Add `page-slide-up` entry animation to marketplace.html, dividends.html
13. Add `focus-within` border highlight to all search inputs
14. Normalize filter pill padding to `6px 12px` across all filter bars
15. Fix "In Progress" → "In progress"
16. Add `row-icon scale(1.04)` hover to dividends holdings table logos

---

## 22. Component Checklist — Required Before Building Anything New

- [ ] Using canonical tokens: `--color-bg-*`, `--color-fg-*`, `--spacing-*`, `--font-size-text-*`
- [ ] Font weights: 400 or 500 only — no 600 or 700
- [ ] No positive letter-spacing
- [ ] No ALL CAPS, no `text-transform: uppercase`
- [ ] `letter-spacing: -0.5px` on `body`
- [ ] Transitions: 120ms (row hover), 150ms (button hover), 100ms (press scale), 200ms (slow reveal)
- [ ] Press state: `scale(0.97) 100ms ease` on all clickable non-row elements
- [ ] Icons: Phosphor only, DuoTone, 16/18/20px sizes
- [ ] Financial values: `font-variant-numeric: tabular-nums`, `white-space: nowrap`
- [ ] Copy: sentence case, actionable, 1–3 word labels
- [ ] `prefers-reduced-motion` media query present at bottom of `<style>` block
- [ ] Card borders: `rgba(0,0,0,0.09)` — never `#E9EAEB` as a border
- [ ] `--radius-lg: 10px` — not 12px
- [ ] Right column width: 400px fixed
- [ ] Content column gap: 40px (`--spacing-5xl`)
