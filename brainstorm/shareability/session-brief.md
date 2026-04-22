# Session Brief — Shareability Feature (B2C Mobile)

**Generated:** 2026-04-16
**Session type:** PM Thinking Coach (Phase 1 of Designer Brainstorm Kit)
**Product:** Surmount B2C mobile
**Feature area:** Shareability / social marketing layer

---

## The User

**Persona:** Maya, 28–32, tech-savvy, urban professional, disposable income, explorer mindset
**Situation:** Holds an active Surmount portfolio. Already consumes investing content on X / TikTok / Reddit. Has opinions, follows a few finfluencers, trades/invests actively enough to feel a sense of identity around it.
**Current workaround:** Screenshots brokerage app, crops in Photos, captions manually, posts to IG Story or sends in iMessage. Or doesn't share at all because it feels cringe and the raw screenshot is ugly.

**User group scope:** 25–35, retail investors who "like to try different things" and have capital. Not the 40–50 conservative cohort, not day-trader / WSB culture. Closer to the Spotify / Strava / Letterboxd-sharing crowd than to the Robinhood Screenshots Instagram crowd.

---

## Jobs to Be Done

When Maya makes an investing decision she feels smart about, she wants to share it in a way that signals taste and discovery — so she gets recognition, belongs to an investing-literate peer group, and expresses identity without looking like she's bragging.

Supporting JTBD: When Maya finds a strategy she likes, she wants to send it to a friend in a way the friend can actually act on — so discovery has shareable utility, not just vibes.

---

## Opportunity Map

Ranked by Teresa Torres' Opportunity Score — Importance × (1 − Satisfaction):

| # | Opportunity | Importance | Current satisfaction | Priority |
|---|---|---|---|---|
| 1 | "I want to share a strategy I'm proud of outward, not post in a separate app" | High | Low | **Top** |
| 2 | "I want my strategy to travel — a friend should be able to act on it in one tap" | High | Low | **Top** |
| 3 | "I want recognition for good discovery/taste, not just raw % gain" | Medium | Low | High |
| 4 | "I want milestone moments I can celebrate without feeling like I'm bragging" | Medium | Low | High |
| 5 | "I want to see what my actual friends do, not only finfluencers" | Medium | Medium (Public, RH Social cover this) | Medium |

---

## Competitive Landscape

| Product | Their bet | What they got right | Gap they left |
|---|---|---|---|
| Robinhood Social (Mar 2026 beta) | Verified real performance, KYC-gated identity, manual copy only | Trust via verification; tuned to Gen Z base | Walled garden — no elegant outbound share primitive. "Robinhood Screenshots" IG account exists because the app can't share outward cleanly |
| Public.com | Twitter-like feed, @handles, deliberately no performance ranking | Discussion culture, rationale posts | Chose discussion over status — killed the flex motive. Internal-only |
| eToro Popular Investors | Professional copy-trading, pay creators up to 2% AUM | Real status economy with monetization | Professional-tier only; not for casual "show my friends" use |
| Blossom (500k users) | Standalone social app layered over existing brokers | Transparency culture, rationale-forward posts | Requires a second app — users leave their broker to socialize |
| Strava (adjacent) | 9:16 outbound cards to IG Stories with auto-generated stats + achievement banners | Zero-effort share-out design | Cards look identical to each other → blend in |
| Spotify Wrapped (adjacent) | Narrative + identity from personal data, 9:16 vertical | "Optimal distinctiveness" — belong + individual. Users become the marketing team | Once-a-year event, not always-on |

**2–3 competitors worth naming that are easy to miss:**
- **Blossom** — most direct analog, proves retail social-investing demand exists. Surmount's structural advantage: being inside the broker.
- **Robinhood Screenshots (Instagram)** — grassroots UGC meme account. Evidence that users want to share outward and the app can't do it elegantly.
- **Strava** — the design bar for shareable activity cards that don't feel cringe.

---

## Market & Business Angle

Shawn named this "close to marketing" — correct framing. This is **primarily a viral-loop UA play**, secondarily retention. Every card shared to Instagram / TikTok / iMessage is a free ad; if the card carries a deep link back to Surmount, shareability becomes the cheapest acquisition channel Surmount has.

**Why now:** Robinhood Social is in beta (1k users, slow rollout). Public chose a non-performance feed. eToro is professional-tier. **There is a ~6–12 month window where a tasteful, outbound, strategy-first share primitive for 25–35 retail investors is unoccupied.**

**Compliance guardrails to respect:**
- Showing structure (strategy composition, allocation %) is generally fine.
- Showing personal dollar performance publicly triggers US / SEC / FINRA issues — Public dodged this by refusing rankings; Robinhood gated it behind KYC.
- Any "copy this" flow needs disclaimers and manual-action affordances, not automated replication.
- All comparative stats ("outperformed 82% of users") need explicit statistical basis and must not read as investment advice.

---

## Directions on the Table

Shawn asked for all three, prioritized A → C → B.

---

### Direction A — Strategy Cards ("Spotify playlist for investing")

The shareable object is a **strategy**, not a personal portfolio.

**What Maya does:** From Surmount's marketplace or her own no-code-built strategy, taps Share. Gets a 9:16 card showing: strategy name, a line of her own "take" (optional), top 5 holdings (anonymized weights or % format), one-line thesis, tasteful branding. Posts to IG Story / sends in iMessage / saves.

**What the recipient does:** Taps the card, lands on that strategy inside Surmount (app-to-app deep link, or a web preview if they don't have the app). Recipient can tap "Invest in this" → onboards into Surmount if needed → the strategy is already cued up.

- **User value:** Maya gets credit for taste and discovery — the strategy becomes a thing she picked. A recipient can actually act on it, so sharing has utility.
- **Business value:** Viral-loop user acquisition. Every share is a free ad with a direct acquisition path. Strategy-as-social-object matches Surmount's existing primitive (marketplace + no-code builder), so engineering is reasonable.
- **Riskiest assumption:** That Maya will share a strategy *from* Surmount — not screenshot her broker. The card has to be beautiful enough to beat a cropped screenshot, and the strategy has to feel like *her* pick (not Surmount's pick).
- **Addresses opportunities:** 1, 2, 3.

---

### Direction C — Moments ("Always-on Wrapped")

Auto-generated, shareable **identity cards** triggered by events. Not performance-first — narrative-first.

**Trigger catalog (starter set):**
- Quarterly / yearly Wrapped
- Strategy anniversaries ("1 year since you started X")
- Held-through-volatility callouts ("You held X through the April dip")
- Diversification achievements ("Your portfolio now spans 5 sectors")
- Comparative bucket stats ("You outperformed 82% of Surmount users in Q1" — needs compliance review on comparisons)
- Contrarian-correct calls ("You bought X when 74% of users were selling")

**What Maya does:** Surmount pings her ("Your Q1 Wrapped is ready"). Opens to a stack of 9:16 cards, animated, personalized. Taps Share → posts to IG Story. Can edit her one-line caption.

- **User value:** Earned, celebratory moments. Identity expression without the bragging feel — the app frames the achievement, Maya just shares it.
- **Business value:** Engagement + retention (people open the app for their moments). UA when shared. Natural cadence = repeated shares over the year.
- **Riskiest assumption:** That moments can be framed in a way that feels earned, not gamified / Duolingo-spammy. The trigger catalog has to be *tastefully* calibrated — too few = boring, too many = cheap.
- **Addresses opportunities:** 3, 4.

---

### Direction B — Portfolio Snapshot ("Clean allocation card")

Maya shares **her own portfolio** — allocation, not dollars, as a shareable card.

**What Maya does:** From her portfolio screen, taps Share. Picks a privacy level (percentage-only, sector-only, top-5-holdings-only). Gets a clean allocation card — donut chart, top positions, a one-line stance she types ("tech-heavy, long-duration"). Posts.

- **User value:** Credibility flex with dignity. Cleaner than a cropped screenshot, with privacy controls.
- **Business value:** Depth signal — users trust Surmount enough to expose their allocation publicly. Lower UA leverage than A (recipient can't adopt someone's personal portfolio).
- **Riskiest assumption:** That a meaningful slice of Maya's cohort will publicly share personal allocation. Many 25–35-year-olds will *not* — it's financial nudity. Likely works best for a smaller sub-segment (finfluencer-track users) and should not be the primary bet.
- **Compliance note:** Keep to percentages and composition. Avoid dollar-denominated P&L on outbound cards.
- **Addresses opportunities:** 3, 5.

---

## My Lean

**Direction A is the foundational bet.** Direction C fast-follows. Direction B last.

Why A first:
- Strategy is Surmount's native primitive (marketplace + no-code builder). Shareability compounds an existing asset instead of adding a new one.
- Clean compliance story — sharing structure is safer than sharing P&L.
- Only direction with a genuine viral loop (recipient can act). This alone justifies the investment.
- The competitive window is narrow and specific to strategy-first outbound — the other apps either don't do outbound (Robinhood Social, Public) or don't do casual (eToro).

Why C second:
- Requires A's card system to already exist (template engine, 9:16 rendering, IG Story flow).
- Adds a retention loop on top of the UA loop A creates.
- Trigger catalog is the hardest design problem in the kit — worth doing *after* A ships and we've seen which moments users already want.

Why B last:
- Smallest audience willing to share (financial nudity).
- No recipient action → weakest UA leverage.
- Highest compliance surface.
- Belongs in the roadmap, not the v1.

---

## Key Assumptions to Test

1. **"A meaningful slice of active Surmount B2C users will share outward if the tool is tasteful."** This is the single bet this whole feature rests on. If 2–5% of MAU don't produce at least one share per quarter, the viral loop math doesn't close.
2. **"Deep-linked recipient flow converts at rates that make the loop economical."** Needs a back-of-envelope target: share-to-install + install-to-invest rate × K-factor.
3. **"Strategy is a shareable unit that users will treat as 'their pick' rather than 'Surmount's pick.'"** Central to Direction A. If users only want to share personal P&L, Direction A is the wrong primitive.
4. **"Comparative stats ('outperformed 82% of users') can be expressed without triggering compliance issues."** Central to Direction C's best triggers. Needs legal read.

---

## Handoff

Next step: run Direction A (and possibly A + C together, since they share card infrastructure) through the **Idea Validator** — four checks (Value / Usability / Viability / Feasibility, plus Trust and Scope for any AI elements) and two persona critiques (Design + Engineering, Leadership).
