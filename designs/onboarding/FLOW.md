# B2C Onboarding Flow

## Entry points

The onboarding flow has two entry surfaces, both reached from the homepage carousel:

| Slide | Target |
|---|---|
| `cash-account.html` (HYCA) | Surmount cash account opening |
| `investing-account.html` | Surmount Investing brokerage account opening |

Both entry pages share a split-layout (`illo-img` + `content` + `cta`) and route to the same step-1 sequence (`legal-name.html`).

The investing entry page uses `assets/illustrations/investing-account-vault.png` (3D safe, sourced from Figma node `566:8071` of file `2wwYoRpClncFrrJzqUqKFf`).

## Three-phase progress model

Defined in `transitions.js` as `FLOW_PHASES`. All three segments render at equal width; within each segment every step takes an equal share of that segment's fill.

| # | Phase | Files |
|---|---|---|
| 1 | Identity & financial profile (13 steps) | `legal-name`, `date-of-birth`, `address`, `citizenship`, `ssn`, `phone`, `verify-phone`, `employment`, `occupation`, `annual-income`, `net-worth`, `funding-source`, `regulatory` |
| 2 | Investment profile (2 steps) | `investing-style`, `investment-experience` |
| 3 | Fund the account (4 steps) | `fund-account`, `fund-amount`, `fund-review`, `fund-success` |

Each page navigates forward via its `<button class="cta">` `onclick`, and backward via `<button class="topbar-back">` `onclick`. `transitions.js` performs an SPA swap between same-document onboarding pages; cross-document navigation falls back to a hard load. The SPA fetch passes `cache: 'no-cache'` so HTML wiring changes propagate without a full refresh.

## Step 1 detail

| Step | Title | Input | Validation |
|---|---|---|---|
| 1 | What's your legal name? | First name + last name | — |
| 2 | What is your date of birth? | DatePicker (auto-mask MM/DD/YYYY) | Real calendar date · not future · year ≥ 1900. Next disabled until valid. |
| 3 | What is your residential address? | Street, unit, city, state, zip | — |
| 4 | What's your citizenship status? | Radio: US citizen · Permanent resident (green card) · Visa holder · Not a US citizen | — |
| 5 | What is your Social Security number? | SSN input + security callout | (Citizenship checkbox removed — answered in step 4) |
| 6 | What's your phone number? | Country select + phone | — |
| 7 | Check your texts | 6-cell OTP code | Demo passes any 6 digits; auto-advances after 350ms |
| 8 | What's your employment status? | Radio: Employed / Self-employed / Retired / Student / Unemployed | — |
| 9 | What's your occupation? | Free-text | — |
| 10 | What's your annual income? | Radio (5 ranges $0 → $200k+) | — |
| 11 | What's your estimated net worth? | Radio (5 ranges <$50k → >$5M) | — |
| 12 | What's your primary source of funds? | Radio: Employment / Savings / Investment earnings / Inheritance / Business / Other | — |
| 13 | Do any of these situations apply to you? | Multi-select compliance checkboxes | — |

## Date picker (`date-of-birth.html`)

Inline implementation that mirrors the design-system `DatePicker` component:

- 296px-wide calendar popover anchored below the field
- Auto-mask: typing `04102000` becomes `04 / 10 / 2000`
- Two-way sync between input and calendar
- Error states: invalid date, future date, year < 1900 — uses `--color-border-error` (`#cb6f68`) and `--color-text-error` (`#98443d`)
- Next CTA is disabled by default, enables only when the field holds a valid full date
- ARIA: `aria-invalid` + `role="alert"` + `aria-describedby` hooks for screen readers

## Verify-phone (`verify-phone.html`)

- Phone icon in 56px rounded-square frame (1px border, soft shadow)
- 6 OTP cells (56×64) using `var(--color-bg-disabled)` (`#f5f5f5`) for the resting fill — visible against the `#fafafa` page background. Hover surfaces `var(--color-border-primary)`. Focus uses white fill + `rgba(10,13,18,0.55)` border + standard 3px ring.
- Auto-advance between cells, backspace jumps back, arrow keys navigate, paste fills all six
- Resend button with 30-second cooldown + status line
- Auto-navigates to `employment.html` 350ms after the 6th digit lands (no Next button — matches the reference)
- Uses `<div role="group" aria-label="Verification code">` instead of `<fieldset>` to avoid the well-known Chrome/Safari fieldset-flex layout bug

## Tokens used (from the shared design system)

These are the only colors/sizes used across the onboarding flow. No hardcoded hex values outside of `:root`.

```css
--color-bg-primary       /* white */
--color-bg-secondary     /* page bg, fafafa */
--color-bg-primary-hover /* fafafa */
--color-bg-disabled      /* OTP cell resting fill */
--color-fg-primary-900   /* primary text */
--color-fg-tertiary-600  /* labels, helper text */
--color-fg-disabled       /* disabled text */
--color-border-primary   /* 9% black border on inputs */
--color-border-error     /* invalid input border */
--color-text-error       /* invalid input message */
--color-text-placeholder /* placeholder text */
--radius-md              /* button/cell sm radius (8px) */
--radius-xl              /* input shell radius (12px) */
--spacing-{xxs..7xl}     /* full DS spacing scale */
```

## Cache busters

Every change to `transitions.css`/`transitions.js` requires bumping the `?v=` query param **on every onboarding HTML file** so that browsers refetch. The `transitions.js` SPA fetch already passes `cache: 'no-cache'`, but the HTML files themselves don't carry a cache buster, so a hard refresh (Cmd+Shift+R) on a stale page is occasionally needed.

Current cache buster: `v=28`.

## Things deliberately NOT done

- **Cash vs investing branching** — both flows currently share the same step 1. Cash accounts may not need citizenship/regulatory in the future; if they don't, the entry page CTA target should be branched (a `?flow=cash` query string + a small fork in `legal-name.html` would do it).
- **Real verification** — `verify-phone.html` accepts any 6 digits as a demo. Wire to a real verify endpoint when integrating with the backend.
- **Persisted progress** — the flow uses sessionStorage only for the progress bar's previous-pct values. Field values are not persisted across reloads.
