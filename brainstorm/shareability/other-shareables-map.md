# Other Shareable Primitives — Beyond the Strategy Card

**Date:** 2026-04-20
**Persona carryover:** Maya, 25–35, tech-savvy retail investor, explorer mindset
**JTBD carryover:** Signal taste and discovery without looking like she's bragging
**Purpose:** Map the full space of shareable objects an investing platform can offer, so we can pick the right follow-ups to Direction A (Strategy Cards).

Each primitive is rated on:
- **Viral loop** — does the recipient have a one-tap action? (H / M / L)
- **Compliance** — how much legal surface does it touch? (Green / Yellow / Red)
- **"Taste-not-brag"** fit — does it signal discovery vs. flex? (High / Med / Low)

---

## Tier 1 — Self-as-object (share *who I am* as an investor)

### 1. Allocation card (Direction B revived)
**What's on it:** A clean donut + sector breakdown, no dollars. "Tech 42% · Energy 18% · Healthcare 15% · Cash 25%." Maya can add a one-line stance: *"tech-heavy, long-duration."*
**Why Maya shares:** It's a picture of how she thinks, not what she made. Closer to an aesthetic mood-board than a flex.
**Compliance:** Green — percentages and composition are generally safe.
**Viral loop:** L — the recipient can't "copy" Maya's personal portfolio; there's no terminal action. But the card can link to *"Build a portfolio like this"* → no-code builder pre-filled with the sector weights, which creates a real action.
**Design hook:** Privacy ladder (percent-only / sector-only / top-5-holdings-only) chosen at share time, not buried in settings.
**Taste fit:** High — allocation *is* taste.

### 2. Investing style card ("Your Investing Identity")
**What's on it:** A short personality-style label generated from Maya's actual behavior: *"Long-Horizon Trend Follower"*, *"Contrarian Accumulator"*, *"Thematic Explorer"*, *"Dividend Compounding Minimalist"*. Subtitle with 3 behavioral traits ("buys on dips · holds >1 year · concentrated in 5 sectors").
**Why Maya shares:** It's a Spotify-Wrapped-style identity object — feels like the app is describing her, which is harder to feel bragging about.
**Compliance:** Green — no numbers, no performance.
**Viral loop:** M — the recipient taps and lands on "Find out yours" quiz flow → onboarding. Classic BuzzFeed loop, but tasteful.
**Design hook:** The label catalog is the whole design problem. Too few labels = not personal; too many = feels random. Maybe 24 archetypes that map onto 2-axis grid (horizon × conviction, or theme × risk).
**Taste fit:** High.

### 3. Watchlist card ("What I'm watching")
**What's on it:** Maya's watchlist — 5–8 tickers with logos, no positions, no dollars. One-line stance: *"Q3 setups I'm tracking."*
**Why Maya shares:** Lower-stakes than a portfolio. Watchlists are already social in the DM-culture ("wyd on NVDA?"). It's the finfluencer's first move.
**Compliance:** Yellow — naming tickers publicly with commentary can read as recommendation. Disclaimer + "not advice" framing required.
**Viral loop:** H — recipient taps a ticker → ticker detail in Surmount → "Add to watchlist" → "Invest." Every ticker on Maya's card is a funnel.
**Design hook:** The watchlist needs to look *curated*, not a dump of 40 tickers. Hard cap at 8. Let Maya reorder them — sequencing is a form of editorial.
**Taste fit:** High — curation is taste.

---

## Tier 2 — Object-of-taste (share *what I think*)

### 4. Conviction card ("Why I'm in this one")
**What's on it:** A single holding + Maya's one-paragraph thesis (tweet-length, 280 char). Ticker logo, a single price-trajectory sparkline with no y-axis numbers, Maya's thesis as the headline. Think Twitter-card meets Letterboxd-review.
**Why Maya shares:** The thesis is the flex. Being right is temporary; having reasons is identity.
**Compliance:** Yellow — single-ticker commentary is the highest-friction case. Must read as opinion, not advice. "Not investment advice" disclaimer, no price targets, no "you should buy."
**Viral loop:** H — recipient taps → ticker page → "Invest."
**Design hook:** The prose area is the card. Typography-first layout. The chart is secondary and intentionally un-axed so nobody screenshots "look, it's up 40%."

### 5. Thesis essay (long-form post)
**What's on it:** A real 300–800 word essay ("Why I think small-cap energy is the next 2 years"). Hosted on a `surmount.com/@maya/theses/...` URL. Maya drafts it in-app, optionally ties it to specific holdings in her portfolio (with composition %, no dollars).
**Why Maya shares:** This is the Substack-pretender move. Maya wants to *write*, not just post. Creates creator ambitions that deepen the platform lock.
**Compliance:** Red — user-generated long-form content about securities is a regulatory swamp. Needs either a clear "opinion, not advice" user-agreement layer, moderation tooling, or both. Probably a v2+ bet.
**Viral loop:** H — OG-rich link preview, essay page has "Invest in what Maya's holding" sidebar.
**Design hook:** The writing UI has to be *better* than Twitter for this to exist. Minimum: markdown support, pullable block-quote for a key line, auto-embed of tickers with live price chips that don't lie about performance.
**Taste fit:** Very high — writing is the ultimate taste signal.

### 6. Trade annotation ("Why I bought today")
**What's on it:** Auto-generated card at the moment of a trade: ticker logo, "Bought AMD" + date + one-line reason Maya types in at execution ("earnings setup, data-center moat"). No dollars, no P&L.
**Why Maya shares:** It's the investing-equivalent of a Strava kudos. The *action* is the content, and the reason is the tasteful layer.
**Compliance:** Yellow — see conviction card. No price, no P&L keeps it safer.
**Viral loop:** H — same ticker-to-invest path.
**Design hook:** Must appear at the *post-trade confirmation* screen, like Strava's "save activity" flow. If you show it 2 hours later in notifications, adoption dies. Optional skip, one-tap to share.

*(This was Story 8 in the existing PRD — flagging it because it belongs in this map even though it's already scoped.)*

---

## Tier 3 — Object-of-moment (share *what just happened*)

### 7. Milestone cards ("First trade," "1-year anniversary," "100th trade")
**What's on it:** Quiet, celebratory cards triggered by behavioral milestones — not performance. "1 year on Surmount," "100 trades," "First dividend received," "Added 5th sector to your portfolio."
**Why Maya shares:** App frames the moment; Maya just forwards it. The "without bragging" clause from the JTBD.
**Compliance:** Green — behavioral, not performance.
**Viral loop:** L — recipient lands on "Claim yours in 30 days" CTA, which is a weak promise. Better paired with the strategy card.
**Design hook:** Calibration is the whole problem. Too many = Duolingo-spam. Too few = nothing to share. Maybe 6 triggers in year 1, hand-curated.

*(This is Direction C — Moments — already scoped in session brief.)*

### 8. Goal progress card ("75% to my house fund")
**What's on it:** A progress ring on a named goal ("House Fund," "Dream Trip," "Baby Fund"). Shows percentage complete, not dollar amounts. Maya chose the goal; the app just paints it.
**Why Maya shares:** Life-stage signal. Works for the audience that already posts running-split screenshots and reading-goal updates. Much less cringe than "I made $4k."
**Compliance:** Green — percentages of private user-chosen goals, no dollars.
**Viral loop:** M — recipient taps → "Start a goal" onboarding. Goal-based investing is also the Wealthsimple / Betterment wedge, so the install funnel has a known pattern.
**Design hook:** Goals must be *named by Maya* in Maya's language, not picked from a dropdown of "Retirement / Emergency / Wealth Building." The naming is where identity lives.
**Taste fit:** Medium-High — closer to lifestyle than investing-taste but still on-brand.

### 9. Streak card ("52 weeks of investing")
**What's on it:** "Invested every week for 52 weeks" or "Held TSLA through 6 corrections." Duolingo-style streak, applied to patience rather than activity.
**Why Maya shares:** Anti-WSB signal — "I'm disciplined, not trading meme-stocks in a basement." Performs conscientiousness, which is scarce content in investing social.
**Compliance:** Green — behavioral.
**Viral loop:** L — recipient CTA is soft ("Start your streak").
**Design hook:** Careful here — a daily/weekly streak turns into loss-aversion pressure that can trigger overtrading. Consider *monthly* or *milestone-only* streaks, not daily.

### 10. Dividend income card ("Your passive income this month")
**What's on it:** Total dividends received this month *as a percentage of portfolio* (not dollars), top 3 payers by logo. Or: "Every 18 days a new dividend payment."
**Why Maya shares:** Passive-income aesthetic is a whole genre on TikTok. People already want to share this; currently they screenshot brokerage dividend pages.
**Compliance:** Yellow — dividend % is still a performance metric. Safer than total P&L but needs legal eyes. Alternative: show only the cadence ("every 18 days") without amounts.
**Viral loop:** M — "See what Maya holds" → top payers link to tickers.
**Design hook:** Resist the urge to make this look like a paycheck. The aesthetic should be *calendar / cadence*, not *bank statement*.

### 11. Contrarian-correct card ("Bought X when 74% of users sold")
**What's on it:** A comparative-stat card showing Maya went against the Surmount-user herd and it worked. ("You bought NVDA during the April selloff — 74% of Surmount users sold.")
**Why Maya shares:** Ultimate taste-not-brag content — "I was right when the crowd was wrong" is a status signal that masquerades as discovery.
**Compliance:** Red — comparative stats are the exact thing flagged in our assumption stress-test. Needs legal sign-off on "outperformed 82% of users" style claims. The sample population disclosure matters (Surmount users ≠ all investors).
**Viral loop:** M — "See where you'd stand" → portfolio-comparison onboarding.
**Design hook:** The statistical framing language is the whole design problem. Who counts as "users"? What's the baseline? Card copy must be pre-approved by legal, not user-editable.

---

## Tier 4 — Object-of-process (share *how I got here*)

### 12. Backtest result card
**What's on it:** "I tested this strategy — here's how it would have done 2019–present." No-code-builder output: strategy name, backtest chart (normalized, no dollars), top holdings.
**Why Maya shares:** It's the "proof of work" — Maya *did something*, not just bought something. Signals analytical taste.
**Compliance:** Red — backtest results are heavily regulated (past performance disclaimers, lookahead bias warnings, survivorship notes required). Needs specific legal framework.
**Viral loop:** H — recipient taps → no-code builder pre-loaded with that strategy → invest.
**Design hook:** Disclaimer must be part of the *card itself*, not a buried tooltip. "Backtested, not live performance" as a visible label on the chart.

### 13. Builder process (time-lapse of building a strategy)
**What's on it:** Short video (5–10s) showing Maya's no-code builder constructing a strategy — drag, weight, rule, done. Muted; designed for IG Reels / TikTok.
**Why Maya shares:** Video is the dominant share primitive in Maya's age range. Process content outperforms outcome content on TikTok.
**Compliance:** Yellow — same as strategy card; showing composition is fine, showing returns is not.
**Viral loop:** H — if the video has a linkable caption.
**Design hook:** The builder UI has to be beautiful *in silent motion*. Every drag, every rule-add, every backtest frame is a keyframe. Motion design is a first-class concern, not polish.

*(This was Story 11 in the existing PRD.)*

---

## Tier 5 — Object-of-relationship (share *about someone else*)

### 14. "Following Maya" card
**What's on it:** Recipient-side — Alex has been following Maya for 6 months, and Surmount auto-generates a card celebrating that. "6 months following Maya's picks."
**Why Alex shares:** Recognition toward Maya. Low ego cost for Alex, high social capital for Maya.
**Compliance:** Green — no performance claims, just relationship.
**Viral loop:** M — others who see the card → "follow Maya" → onboards.
**Design hook:** This is a two-party card. Both parties' agency matters — Maya should control what's "followable" about her; Alex should control whether his follow is public.

### 15. Friend-in-this-strategy badge
**What's on it:** A small callout when Maya's friend is in a strategy: "Priya is also in this strategy." Shared by Maya to IG with the strategy card, with the friend tag (opt-in).
**Why Maya shares:** Social proof. "I'm not alone" framing.
**Compliance:** Green — identity-opt-in only.
**Viral loop:** H — baked into strategy share.
**Design hook:** Privacy gate is everything. Default off. Maya can opt to appear in friends' "who's in this" widgets; never the other way around.

*(This was Story 7 in the existing PRD.)*

---

## My ranking (if I were building the roadmap)

**Tier-1 priority (fast follow to Strategy Cards):**
1. **Watchlist card** (#3) — strong viral loop, taste-y, low compliance if framed right. This is probably the single best next-bet.
2. **Allocation card** (#1) — Direction B redeemed. Strong privacy ladder solves most concerns. Taste-heavy.
3. **Investing style card** (#2) — low compliance, high taste, "wrapped"-pattern proven. Great quiz-loop for install.

**Tier-2 (requires more scaffolding):**
4. Conviction card (#4) — high leverage, medium compliance.
5. Goal progress (#8) — adjacent-market primitive (robo-advisor wedge). Do if Surmount wants to enter goal-based investing.
6. Contrarian-correct (#11) — best "taste-not-brag" primitive in the whole kit, but needs legal.

**Tier-3 (v2+):**
7. Thesis essay (#5), backtest card (#12), dividend income (#10), streak (#9), milestone (#7) — all have a there-there, but ship after we've seen which of T1/T2 hit.

---

## Design principles that apply across all of these

1. **Percentages, not dollars.** Compliance Green vs. Yellow often turns on this one choice.
2. **Taste vs. brag is a copy problem.** "Maya's take," "what I'm watching," "why I'm in this" — language choices decide whether the card feels warm or Robinhood-Screenshots-y.
3. **Every card needs a recipient action.** A share without a terminal action (tap → land on → act) is retention decoration, not a viral loop.
4. **Privacy ladder at share time.** Users should pick what to show *at the moment of sharing*, not deep in settings. Defaults should be conservative.
5. **The card must look different from everyone else's card.** Optimal distinctiveness: Surmount cards all share a visual grammar (= belonging) but Maya's card reveals something that's specifically Maya's (= individual). Lose either side and the format dies.
6. **Loss-framing has to be designed, not ignored.** A down-month dividend card, a portfolio underwater vs benchmark, a failed goal — each needs a dignified failure state or an explicit suppression rule. Same note as Direction C.

---

## What to do with this

This is a menu, not a plan. Real next steps:
- **Pick 2–3 to prototype** alongside the Strategy Card — Watchlist + Allocation are my picks.
- **Legal triage** — get the lawyer to color each one Green/Yellow/Red so we stop guessing.
- **Concierge test** for any of the top 3 that aren't covered by the existing Strategy Card concierge test. Specifically, Watchlist is a different share behavior than Strategy (lower stakes, more frequent), so the share-rate number won't carry over.
- **Revisit after Strategy Card ships** — Story 3's instrumentation will tell us what kinds of objects people actually grab. That data should drive which primitive in this map gets built next, rather than a priori rankings like the one above.
