# Surmount B2C — Project Context

> Consumer-facing product. Shares design system, brand, and Geist/Inter fonts with B2B.
> Read this before building any B2C feature. It captures all patterns established in the homepage and strategy-detail builds.

---

## Product Overview

- **Audience**: Retail investors / consumers
- **Figma file**: TBD
- **Dev server**: port `7778` → `~/Surmount/B2C/designs/`
- **Status**: Homepage + strategy detail built; no-code builder exists

---

## Key Differentiators from B2B

- More guided — users may be less financially sophisticated
- Warmer, more accessible copy tone; explanatory text acceptable
- Lower information density than B2B
- Still: no gamification, no gradients, same brand tokens and Geist/Inter fonts
- Inter (`--font-family-display`) used for large display numbers (KPI, portfolio value)

---

## App Shell

```
shell.html
├── <app-sidebar active="…"> — Web Component from sidebar.js
└── <iframe src="create.html">  — or direct page for non-iframe builds
```

Homepage and strategy-detail use a **two-column layout**:
- **Left column**: `flex:1; overflow-y:auto; overflow-x:clip; scrollbar hidden` — main content scroll
  - Use `overflow-x:clip` NOT `overflow-x:hidden` — `clip` avoids creating an unwanted scroll container, so negative-margin tricks still work
- **Right column**: `width:400px; flex-shrink:0` — fixed sidebar (buy/sell panel, widgets)
- Scrollbar hidden globally: `scrollbar-width:none; -ms-overflow-style:none; ::-webkit-scrollbar{display:none}`

---

## Layout & Spacing Patterns

### Page Header
```css
/* padding:24px 24px 16px — no background, no border, no shadow */
.page-header { padding: 24px 24px 16px; }
```

### Content Area
```css
/* padding:20px 24px 0, gap:40px between sections */
.page-content { padding: 20px 24px 0; gap: 40px; display: flex; flex-direction: column; }
```

### Section Headers
```css
font-size: var(--text-xs);              /* 12px */
font-weight: var(--font-weight-medium);
color: var(--color-text-tertiary);      /* #717680 */
letter-spacing: -0.3px;
```

### Cards
```css
background: var(--color-base-white);
border: 1px solid rgba(0,0,0,0.06);    /* softer than B2B */
border-radius: var(--radius-xl);        /* 12px */
box-shadow: 0 2px 12px 0 rgba(10,13,18,0.03);
padding: var(--space-5);                /* 20px */
```

### Floating / Chart Section (no card)
Used in strategy-detail for the chart + price display area:
```css
/* no border, no background — sits directly on page surface */
display: flex; flex-direction: column; gap: var(--space-3);
```

---

## Typography in Practice

| Use | Font | Size | Weight | Color |
|---|---|---|---|---|
| Large KPI / portfolio value | Inter (`--font-family-display`) | 28px | 400 | `--color-text-primary` |
| KPI cents / decimals | Inter | 16px | 400 | `--color-text-primary` |
| Strategy name / page title | Inter | 24px | 500 | `#fff` (on dark overlay) |
| Section title | Geist | 20px | 600 | `--color-text-primary` |
| Body / table data | Geist | 14px | 400 | `--color-text-primary` |
| Labels / metadata | Geist | 12px | 400–500 | `--color-text-tertiary` |
| All letter-spacing | — | — | — | `-0.3px` to `-0.5px` (never positive) |

**Never use Inter for body text.** Inter = display/numbers only. Geist = everything else.

---

## Color Conventions

| Context | Color |
|---|---|
| Positive return / gain | `#316434` (text), `#3B7E3F` (chart line/marker) |
| Negative return / loss | `#98443D` |
| Chart area fill (top) | `rgba(59,126,63,0.18–0.22)` |
| Chart area fill (bottom) | `rgba(59,126,63,0)` |
| Primary CTA | `var(--color-brand-600)` → `#406AD0` |
| Active segment pill | `#ffffff` bg, shadow, `#181D27` text |
| Segment track bg | `#EFEFEF` |
| Crosshair line | `#A4A7AE`, dashed |

---

## Component Patterns

### Page Header — Nav Back Button

```css
/* Default: no border, no background, no shadow */
.nav-back-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0;
  border-radius: 8px;
  color: rgba(10,13,18,0.7);
  transition: padding-left 200ms ease, background 200ms ease, color 200ms ease;
}
.nav-back-btn:hover {
  padding-left: 12px;
  background: #F5F5F5;
  color: rgba(10,13,18,0.9);
}

/* Chevron: hidden at rest, fades in on hover */
.nav-back-chevron {
  width: 0; opacity: 0;
  transition: width 200ms ease, opacity 200ms ease;
}
.nav-back-btn:hover .nav-back-chevron { width: 18px; opacity: 1; }

/* Avatar: 20px circle */
.nav-back-avatar { width: 20px; height: 20px; border-radius: 50%; }
```

Action buttons (star + share) in the header:
```css
/* Shared */
background: #fff;
border: 1px solid rgba(0,0,0,0.09);
border-radius: 8px;
box-shadow: var(--shadow-card);

/* Star button */
padding: 8px;
/* icon: 20×20 */

/* Share button */
padding: 8px 12px;
gap: 4px;
/* icon: 16×16 + "Share" text */
```

### Buy/Sell Widget

Container:
```css
background: #fff;
border: 1px solid rgba(0,0,0,0.06);
border-radius: 12px;
box-shadow: 0 2px 12px 0 rgba(10,13,18,0.03);
overflow: hidden;
```

Tabs:
```css
gap: 20px; padding: 0 20px;
border-bottom: 1px solid rgba(0,0,0,0.06);
/* Active tab underline */
/* Buy: */ border-bottom: 2px solid #181D27;
/* Sell: */ border-bottom: 2px solid var(--color-gray-400);
```

Amount input wrapper (`.wt-amount-wrap`):
```css
width: 150px; height: 36px;
border: 1px solid rgba(0,0,0,0.06);
border-radius: 8px;
/* Focus-within: */
border-color: var(--color-brand-600);
box-shadow: 0 0 0 3px rgba(64,106,208,0.10);
```

Dollar prefix `$` span:
```css
/* Empty: */ color: rgba(10,13,18,0.4);
/* Filled (uses :has(:not(:placeholder-shown))): */ color: var(--color-text-primary);
/* Transition: color 150ms ease */
```

Review/Next button states:
```css
/* Disabled */
background: #F5F5F5;
border: 1px solid #E9EAEB;
color: #A4A7AE;
cursor: not-allowed;

/* Active */
background: var(--color-brand-600);
border-color: var(--color-brand-600);
color: #fff;
cursor: pointer;
```

Submit button:
```css
background: var(--color-brand-600);
border-radius: 8px;
height: 38px;
/* Shows 2s loading spinner, then transitions to submitted state */
```

Done button (submitted state):
```css
background: var(--color-brand-600);
border-radius: 9999px;
```

View details link (submitted state):
```css
background: transparent; border: none;
color: rgba(10,13,18,0.6);
```

Account dropdown: must use `position:fixed` + JS `getBoundingClientRect()` to escape `overflow:hidden` on the widget container. Never use `position:absolute` here.

### Portfolio Chart (`portfolio-chart.js`)
- **Stack**: lightweight-charts v5 + React 18 (CDN UMD), zero build step
- **Series**: `AreaSeries` with `lineWidth:1.5`, crosshair marker radius 4, white border
- **No axes**: `timeScale:{visible:false}`, `rightPriceScale:{visible:false}`
- **No attribution**: `layout:{attributionLogo:false}`
- **Background**: always `transparent` — inherits parent surface
- **rightOffset**: `0` so line fills flush to right edge
- **Draw-on animation**: 800ms ease-out cubic on mount, 450ms ease-in-out on range change
- **Range transition**: both edges interpolate simultaneously (zoom in/out feel)
- **Time pill**: floating white capsule on x-axis, slides with `transition:left 60ms ease-out`, ticks with `pcTick` keyframe on date change
- **Tooltip**: absolute div, flips left/right at midpoint, shows date / value / day change
- **`onHover` prop**: fires `{value,change,pct,pos,timeStr}` — wire to live-update price display above chart
- **`hideRangeSelector` prop**: omits segmented control (used on homepage)
- **Segmented control**: `#EFEFEF` pill track, `padding:3px`, active item = white capsule with `box-shadow:0 1px 3px rgba(0,0,0,0.10)`

### Ticker / Company Logos
```css
.ticker-logo {
  width: 32px; height: 32px;
  border-radius: var(--radius-full);
  border: 0.75px solid rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 150ms ease;
}
.ticker-logo img { width:100%; height:100%; object-fit:cover; display:block; }
/* hover: */ .pb-row:hover .ticker-logo { transform: scale(1.05); }
```
- Logo assets: `~/Surmount/B2C/designs/Company logo/`
- Naming: `company_logo_NVDA.webp`, `company_logo_AAPL.webp`, `company_logo_MSFT.webp`, `company_logo_GOOG.webp`, `company_logo_AMZN.webp`, `company_logo_MA.webp`, `company_logo_META.webp`, `company_logo_TSLA.webp`, `company_logo_NFLX.webp`, `company_logo_V.webp`
- Fallback: colored circle with 1–2 letter initials

### Broker Avatar Files
Used in widget dropdowns, review rows, stat pills (20px circles):
```
assets/av-robinhood.png
assets/av-coinbase.png
assets/av-ibkr.png
assets/av-schwab.png
assets/av-webull.png
```

### Broker Logo Containers
```css
.broker-logo { width:32px; height:32px; border-radius:var(--radius-sm); border:1px solid rgba(0,0,0,0.07); overflow:hidden; padding:0; }
.broker-logo img { width:100%; height:100%; object-fit:cover; display:block; }
```

### Avatar Stack (small broker icons in pills)
```css
.av-sm {
  width:20px; height:20px;
  border-radius:var(--radius-full);
  border:0.5px solid rgba(0,0,0,0.08);
  margin-right:-5px;
  overflow:hidden; object-fit:cover;
  box-shadow:0px 2px 20px rgba(0,0,0,0.06);
}
```

### Stat Pills (`.sd-pills-row`)
```css
.sd-pill {
  flex:1; background:var(--color-base-white);
  border:1px solid rgba(0,0,0,0.06);
  border-radius:var(--radius-lg);
  /* NO box-shadow */
  padding: 16px;
  display:flex; flex-direction:column; gap:var(--space-1-5);
}
```

### Strategy Hero Card (`.sd-card`)
```css
.sd-card {
  border-radius: var(--radius-md);         /* 8px, NOT 12px */
  border: 1px solid rgba(0,0,0,0.09);
  box-shadow: var(--shadow-card);
  overflow: hidden; position: relative; height: 180px;
}
.sd-card-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; }
.sd-card-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(47,27,0,0) 6%, rgba(47,27,0,0.95) 97%); }
.sd-card-text { position:absolute; bottom:10px; left:12px; right:120px; z-index:1; }
.sd-card-name { color: rgba(255,255,255,0.95); font-family: var(--font-family-display); }
.sd-card-desc { color: rgba(255,255,255,0.85); }
```

### Similar Strategies Section
Horizontal scrollable row:
```css
overflow-x: auto; display: flex; gap: 20px;
```

Cards:
```css
width: 350px; flex-shrink: 0;
border: 1px solid rgba(0,0,0,0.06);
border-radius: 12px;
overflow: hidden;
/* Hover — NO transform/translateY */
border-color: rgba(0,0,0,0.14);
box-shadow: 0 2px 8px rgba(10,13,18,0.05);
```

Card hero:
```css
height: 132px;
/* Real cover photo + gradient */
background: linear-gradient(to bottom, rgba(47,27,0,0) 6%, rgba(47,27,0,0.8) 98%);
```

Strategy name on hero: Inter, 18px, weight 500, white.

Card meta section:
```css
gap: 24px;       /* between stats */
/* Dividers: height:24px, color:rgba(0,0,0,0.08) — NO border-top between meta and card */
```

Stat labels: `rgba(10,13,18,0.6)`, 12px. Values: 14px, medium weight. Risk value: 400 weight.

Cover images: `assets/Surmount Strategy Covers/[Strategy Name].png`

### Risk Dot
```css
/* Pure CSS — do NOT use an image */
.risk-dot { width:10px; height:10px; border-radius:var(--radius-full); background:#3B7E3F; display:inline-block; flex-shrink:0; }
```

### Tables (holdings / strategy breakdown)
```css
.pb-row {
  display:flex; align-items:center;
  border-bottom:1px solid var(--color-border-default);
  padding:var(--space-3) 0;
  transition:background 120ms ease;
}
.pb-row:hover { background:var(--color-surface-subtle); }
/* Header row: --color-text-tertiary, 12px, sentence case — NOT uppercase */
```

---

## Micro-interactions Inventory

| Element | Interaction | Spec |
|---|---|---|
| Chart — mount | Draw left→right | 800ms, `cubic ease-out: 1-(1-t)³` |
| Chart — range change | Both edges zoom | 450ms, `cubic ease-in-out` |
| Chart — time pill | Slide on x-axis | `transition:left 60ms ease-out` |
| Chart — time pill date change | Tick up from below | `pcTick` keyframe, 150ms ease-out |
| Chart — tooltip | Flip at midpoint | Instant reposition, no transition |
| Price header — hover | Live value update | Direct DOM text swap |
| Ticker logo — row hover | Scale up | `transform:scale(1.05)` 150ms ease |
| Nav back button | `padding-left` 0→12px + chevron `width:0→18px opacity:0→1` | 200ms ease |
| Buy/sell account dropdown | Animated height reveal: `grid-template-rows:0fr→1fr` + `opacity:0→1`, `margin-top:-14px→0` to cancel gap | 200ms ease |
| Submit button loading | Spinner-in-button 2s, then slides to submitted state via `wtSlideIn` keyframe | — |
| Review/Submitted panels | `display:none→flex`, `@keyframes wtSlideIn {from{opacity:0;transform:translateY(6px)}}` | 180ms ease |
| Strategy card hover | Border darkens, subtle shadow — NO `translateY` lift | — |
| Table row — hover | Surface background | `background:--color-surface-subtle` 120ms |

---

## Live Price Header Pattern

When a `PortfolioChart` sits above a price display, wire `onHover` to update the DOM directly (no React re-render):

```js
function onHover(data) {
  if (!data) { /* restore defaults */ return; }
  var parts = data.value.toFixed(2).split('.');
  wholeEl.textContent = '$' + parseInt(parts[0]).toLocaleString('en-US');
  centsEl.textContent = '.' + parts[1];
  changeEl.textContent = (data.pos ? '+' : '-') + '$' + ...;
  changeEl.style.color = data.pos ? 'var(--color-text-success)' : 'var(--color-text-error)';
  periodEl.textContent = formattedDate;
}
```

---

## Asset Paths (relative to `B2C/designs/`)

```
assets/
  strategy-hero-bg.jpg            — Dubai skyline, strategy hero card bg
  icon-star.svg                   — Star action button (use --stroke-0 CSS var, fallback #A4A7AE)
  icon-share-new.svg              — Share action button (from Figma)
  av-robinhood.png                — 20px broker avatar (widget dropdowns, review rows, pill stacks)
  av-coinbase.png
  av-ibkr.png
  av-schwab.png
  av-webull.png

  Surmount Strategy Covers/
    [Strategy Name].png           — Cover photos for similar strategy cards

Company logo/
  company_logo_NVDA.webp
  company_logo_AAPL.webp
  company_logo_MSFT.webp
  company_logo_GOOG.webp
  company_logo_AMZN.webp
  company_logo_MA.webp
  company_logo_META.webp
  company_logo_TSLA.webp
  company_logo_NFLX.webp
  company_logo_V.webp
  AMD Company Logo.webp
  Company Logo TMUS.webp
  IBKR Logo.png
  robinhood.png
  kraken.png
  wellbulllogo.png
  Surmount_logo.png
  tradeStation.jpeg
  tradier.png
```

---

## Files Reference

| File | Purpose |
|---|---|
| `homepage.html` | Portfolio dashboard — main B2C page |
| `strategy-detail.html` | Strategy detail page: hero, chart, holdings table, buy/sell widget |
| `create.html` | Strategy portfolio grid — 2-col card layout with Related accounts, Total return, Next Rebalance |
| `portfolio-chart.js` | Reusable React+lightweight-charts component |
| `sidebar.js` | `<app-sidebar>` Web Component |
| `stratey-builder/shell.html` | Shell with sidebar iframe |
| `index.html` | Hub listing all B2C explorations |

---

## CDN Scripts Required (add to any page using PortfolioChart)

```html
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/lightweight-charts@5/dist/lightweight-charts.standalone.production.js"></script>
<script src="portfolio-chart.js"></script>
```
