# Surmount B2C — Onboarding Flow · Design Hand-off

**Scope:** the end-to-end account-creation journey, from sign-up through landing on the
(empty) investing dashboard. Built in the B2C Next.js app (`~/Surmount/B2C/app`).

**Live (Vercel):** https://app-ten-bay-85.vercel.app — start at `/` (sign-up) or jump in at `/onboarding/welcome`. Full screen index at `/dev`.

---

## 1. Flow map

```
/  (Login / Sign-up)
│
├─ Sign in ───────────────► /home                      (returning user)
│
└─ Sign up ──► "Check your email" ──(open link)──► /onboarding/welcome
                                                    │
                                                    ▼
                                          /onboarding/about-you         (KYC questions)
                                                    │  ← forward slide transition →
                                                    ▼
                                       /onboarding/start-investing       (choose how)
                                          │                       │
              ┌───────────────────────────┘                       └──────────────────────┐
              ▼                                                                            ▼
   /onboarding/connect-brokerage                                        /onboarding/investing-account
   (pick broker → secure-connect modal)                                 (Surmount Investing — opens the
              │                                                          existing KYC + funding flow:
              ▼                                                          legal-name → … → fund-success)
   /onboarding/brokerage-connected
              │
              ▼
   /home?state=empty&connected=<broker>   (first-time empty dashboard)
```

Two ways to start investing; both end on the dashboard. The "Connect a brokerage" path is
the fast path (pull holdings/cash from an existing broker). "Open a Surmount account" is the
full brokerage-opening flow (already built).

---

## 2. Screens & annotations

### 2.1 Login / Sign-up — `/`
Single card, animated height between modes. `src/components/LoginPage.tsx`.

**Modes (states):** `sign-in` · `sign-up` · `verify-email` · `forgot-password` · `reset-sent`.

**Sign-up fields:** First name, Last name, Email, Password, Confirm password, Captcha →
**Continue**; plus **Sign up with Google**; "Already have an account? Sign in".

**Password requirements (live):** focusing the Password field opens a popover listing four
rules, each flipping gray-circle → green-check as satisfied:
1. At least 8 characters · 2. One uppercase letter · 3. One number · 4. One special character.
On **Continue**, if not all four pass → field goes to **error state** + message
"Your password doesn't meet all the requirements below." (popover stays open).

**Edge cases**
- Empty required field → inline "X is required."
- Invalid email format → "Invalid email format."
- Confirm ≠ password → "Passwords do not match."
- Captcha empty → "Please enter the captcha."
- Sign-in with wrong creds → error toast "Incorrect email or password." (demo creds:
  `logan@surmount.ai` / `12345678` → `/home`).
- Reduced motion: card height + popover animate as a quick fade only.

**verify-email ("Check your email")**
- Shows the address the link was sent to.
- **Primary CTA "Open verification link"** → `/onboarding/welcome` (simulates the email click —
  this is the hand-off point from auth into onboarding).
- "Didn't receive a link? **Resend**" (60s cooldown, shows `Resend in Ns`).
- "Back to login".

---

### 2.2 Welcome — `/onboarding/welcome`
**First onboarding screen** (the post-email-link landing). Split layout: illustration + content.
Two-step overview, no progress bar (entry screen):
1. **About you** — "Answer a few quick questions so we can get to know you and set up your account."
2. **Start investing** — "Connect a brokerage you already use, or open a Surmount account — and start investing right away."

**CTA:** "Get started" → `/onboarding/about-you`. Top bar = brand only (no back/close — nothing to go back to). Footer: Terms & Disclosures.

---

### 2.3 About you — `/onboarding/about-you`
KYC / get-to-know-you quiz, **5 questions**, single continuous progress bar.
Questions: Motivation · Involvement · Style (cards) · Interests (multi) · Themes (multi).

**States/interactions**
- Required single/card steps gate "Next"; optional multi steps can be skipped.
- "Other (specify)" reveals a free-text input (multi steps).
- Between questions: directional **slide + fade** (forward/back), 200/260ms.
- **Final question → start-investing:** plays the **forward exit** (slide-left + fade) before
  navigating; `start-investing` mounts with a matching **forward enter** — one continuous motion
  across the route boundary. CTA label is "Continue" on the last step ("Next" otherwise).
- Back on step 0 → `/onboarding/welcome`. Reduced motion → fade only.

**Edge case:** these are the same questions as before but now framed as KYC (not strategy
recommendation); nothing downstream depends on the answers in the prototype.

---

### 2.4 Start investing — `/onboarding/start-investing`
Centered choice, two method cards. **Enter animation** mirrors about-you's exit.

1. **Connect a brokerage** (Phosphor `Link` icon) → `/onboarding/connect-brokerage`.
   Sub-copy + a row of supported broker logos (Coinbase, Kraken, Alpaca, E*Trade).
2. **Open a Surmount account** (Surmount mark, full-bleed) → `/onboarding/investing-account`.

**Top bar:** Back → about-you. **No Close** (can't close mid-flow). Footer: Terms.

---

### 2.5 Connect a brokerage — `/onboarding/connect-brokerage`
Vertically centered. Title + search field + brokerage list. `'use client'`.

**Supported (clickable):** E*Trade · Alpaca · TradeStation · Coinbase · Kraken · Alpaca Paper · Surmount Paper.
**Coming soon (disabled, bottom of list):** Robinhood · Charles Schwab · Interactive Brokers · Webull —
grayscale logo, muted text, not clickable, **"Coming soon" tag** instead of a chevron.

- Logos are **32px** circular avatars; rows are single-line (no subtitle).
- **Paper accounts** (Alpaca Paper, Surmount Paper) show an **info (i)**; hover/focus reveals a
  dark tooltip: "A paper account uses virtual money — practice investing and test strategies
  without risking real funds."

**Secure-connect modal** (on selecting a supported broker)
- Paired logos: `broker ◀ Link ▶ Surmount` (32px each).
- "Connect {broker} to Surmount" + two assurances (ShieldCheck "Sign in securely",
  Lightning "Invest right away") + legal line.
- **Continue to {broker}** → `/onboarding/brokerage-connected?broker=<id>`.
- Dismiss: ✕, backdrop click, or Esc.

**Edge cases**
- Search with no matches → "No brokerages match "<query>"."
- Disabled rows are inert (no modal, no hover lift).
- All icons are real Phosphor components (no hand-drawn SVG).

---

### 2.6 Brokerage connected — `/onboarding/brokerage-connected?broker=<id>`
Success screen. Paired avatars `broker ✓ Surmount`, "You're connected to {name}",
"Your holdings and buying power are now available on Surmount. You can start investing right away."

**CTA:** "Start investing" → `/home?state=empty&connected=<id>` (lands on the empty dashboard
for that broker). Unknown/missing `broker` param → falls back to "your brokerage" + Surmount mark.

---

### 2.7 Surmount Investing entry — `/onboarding/investing-account`
The alternate path (open Surmount's own brokerage account). Split layout, value props, **Open
account** → `/onboarding/legal-name` (the full existing KYC → funding flow).

**Top bar:** **Back → start-investing** (so an accidental "Open a Surmount account" is
recoverable). **No Close.**

---

### 2.8 Empty dashboard — `/home?state=empty&connected=<broker>`
First-time state after connecting a brokerage. Query-param variant of the real `/home`.

- **Hero:** connected-account chip (logo + name) + "Available to trade" + cash balance.
  **No** returns/chart/changes (nothing invested yet). "Connect accounts" stays available.
- **Invested strategies →** empty state + **"Explore the marketplace"** CTA.
- **Portfolio breakdown →** empty state.
- **Recent activities →** empty state.
- **Watchlist →** empty state (controls hidden).
- **Right-rail carousel →** two banners only, in order: ① "Start with a Surmount account"
  poster ② "Boost your savings 4.35% APY". ("Pick your first strategy" is intentionally
  excluded — it belongs to the Surmount Investing activation flow.)

**Params:** `state=empty` toggles the variant; `connected=<id>` selects the broker
(kraken·coinbase·alpaca·etrade·tradestation; others fall back to Kraken). Mock cash figures.

**Open item:** "Explore the marketplace" currently points to `/strategy-result` as a
placeholder — no dedicated marketplace route exists yet. Repoint when one is built.

---

## 3. Design-system rules applied
- **Tokens only** — `var(--*)`, no raw hex/px (sanctioned exception: `#252b37` dark-button hover).
- **No blue in chrome** — focus/selection/chrome use neutral grays; success = `--color-utility-success-700` green; blue reserved for data/content only.
- **Type:** Geist body / Inter display; **font-weights 400 & 500 only**; default **-0.5px** letter-spacing; **sentence case** (never ALL CAPS).
- **Icons:** real `@phosphor-icons/react` components, **regular** weight (no DuoTone, no hand-drawn paths). Server components import from `@phosphor-icons/react/dist/ssr`.
- **Cards:** 6%-alpha border + soft shadow; **inputs:** 9%-alpha border, no shadow.
- **Motion:** persistent containers, restrained ease; everything respects `prefers-reduced-motion`.

## 4. Known gaps / decisions for product
1. **Marketplace route** — empty-state CTA placeholder (`/strategy-result`).
2. **Paper-account logos** — Alpaca Paper reuses Alpaca, Surmount Paper reuses the Surmount mark.
3. **"Coming soon" tag** copy — rendered as "Coming soon" (no ellipsis).
4. **Per-broker cash** — mock values; `alpaca-paper`/`surmount-paper` fall back to default.
5. Email verification is simulated (the "Open verification link" button); wire to a real
   verify endpoint when there's a backend.

## 5. Deployment
- Project: Vercel `app` (team `68J6…`). Production build passes (`npm run build`).
- Deploy command: `vercel --prod` from `~/Surmount/B2C/app`.
- **Production URL:** https://app-ten-bay-85.vercel.app (all key routes verified 200).
- Key routes to review: `/` · `/onboarding/welcome` · `/onboarding/about-you` ·
  `/onboarding/start-investing` · `/onboarding/connect-brokerage` ·
  `/onboarding/brokerage-connected?broker=kraken` · `/home?state=empty&connected=kraken`.
  (Full screen index lives at `/dev`.)
