# PRD — Surmount Strategy Cards (Shareability v1)

**Date:** 2026-04-16 (updated 2026-04-17)
**Owner:** Shawn (Design)
**Source artifacts:** session-brief.md, validation-strategy-moments.md, stories-strategy-cards.md
**Status:** v1 prototype built — Stories 1, 4, 5 implemented in Expo mobile app. Infrastructure gaps (universal links, deferred deep-link provider, auth intent-preservation) remain for production hardening.

---

## 1. Summary

Surmount Strategy Cards is a mobile-first outbound share primitive that turns any Surmount strategy — whether curated from the marketplace or built in the no-code builder — into a beautiful, shareable 9:16 card with a friend-actionable deep link. The primary persona is Maya, a 28–32-year-old tech-savvy retail investor who already posts investing content on Instagram and iMessage but whose workaround today is cropped screenshots with no context and no recipient action. Now is the right moment because Robinhood Social launched into a 1,000-user beta in March 2026 as an internal feed with no outbound share primitive, leaving a ~6–12 month window for a strategy-first, broker-native, outbound-card product that has no direct equivalent today. Success looks like ≥15% of Surmount B2C MAU producing at least one share per quarter within the first 90 days post-launch, with a measurable K-factor above 0.3 by day 180.

---

## 2. Background & Problem

**The problem:** When Maya makes an investing decision she feels smart about, she has no way to signal taste and discovery inside Surmount that gets her the recognition she wants from her peers. Raw screenshots of her portfolio are ugly, carry no context, read as bragging, and give her friends nothing to do if they're interested. So most of the time, she shares nothing. When she does share, it's a cropped screenshot in iMessage to one friend, and the signal dies there.

**Current workaround:** Maya screenshots a Surmount screen, crops it in the Photos app, opens Instagram Stories, places the screenshot, types a caption, and posts. Or she sends the screenshot in iMessage to one friend. Either way, the shared artifact is low-quality, context-free, un-brandable, and — most importantly — non-actionable for the recipient.

**Why this matters now:**
- **Competitive window:** Robinhood Social is in a 1k-user beta as an internal feed only (no outbound share). Public.com deliberately refuses performance ranking. eToro's Popular Investor program is for professionalized users only. Blossom is a separate app that requires users to leave their broker. No one currently owns "strategy-first outbound card inside the broker, tuned for casual sharing."
- **Behavior signal:** The "Robinhood Screenshots" Instagram account exists and curates user-submitted portfolio screenshots — grassroots evidence that the demand is real and the app-level solution is absent.
- **Business imperative:** Surmount has a "close to marketing" mandate for this feature. Every card shared is a free ad; every card with a deep link is an acquisition surface. This is Surmount's cheapest potential UA channel.

**What we're NOT solving in v1:**
- We are not shipping Direction C (auto-generated Moments / Wrapped cards). That's a fast-follow, gated on observed v1 share rate.
- We are not shipping Direction B (personal portfolio/allocation share). Compliance surface is higher, recipient cannot act on a personal portfolio, and the sharing-willingness population is narrower (financial nudity).
- We are not building an internal social feed (Public.com / Robinhood Social model). Outbound share is the whole bet.
- We are not building automated copy-trading (eToro model). Any recipient action is explicit and manual.

---

## 3. Personas & User Segments

**Primary persona (sharer):**
```
Name:     Maya
Who:      28–32, tech-savvy urban professional, Senior PM or Designer,
          disposable income, explorer mindset, already active on
          Instagram Stories and in investing-adjacent group chats.
Situation: Holds an active Surmount portfolio. Follows a handful of
          finfluencers. Has opinions, capital, and a peer group that
          takes investing seriously.
JTBD:     When Maya makes an investing decision she feels smart about,
          she wants to share it in a way that signals taste and
          discovery, so she gets recognition, belongs to an investing-
          literate peer group, and expresses identity without looking
          like she's bragging.
Current workaround: Screenshots the Surmount app, crops in Photos,
          captions manually, posts to IG Story or sends in iMessage.
          Or shares nothing because the screenshot looks cringe.
```

**Secondary persona (existing-user recipient):**
```
Name:     Priya
Who:      29, already has Surmount installed, follows Maya on Instagram.
Situation: Sees Maya's card on her Story, is curious about the specific
          strategy.
JTBD:     When Priya sees a strategy from a friend she trusts, she wants
          to read it and decide quickly without hunting through the app,
          so she can act on good signal without friction.
Current workaround: Remembers the strategy name (maybe), opens Surmount,
          searches for it. Often just gives up and keeps scrolling.
```

**Tertiary persona (non-user recipient — the growth persona):**
```
Name:     Alex
Who:      27, does not have Surmount, is on the fence about which
          investing app to use.
Situation: Sees Maya's card on IG, intrigued enough to tap.
JTBD:     When Alex is curious about a specific thing a friend shared,
          he wants to see it before installing anything, and if he
          installs, land on the specific thing without starting from
          scratch.
Current workaround: Taps shared links from friends; most dead-end or
          drop him at a generic app-store page with no intent preserved.
          Usually doesn't install.
```

**Who this is NOT for:**
This feature is not for the 40–50 conservative retail segment (won't share outward), not for day-trader / WSB-style culture (wants personal P&L flex, not strategy structure), and not for financial advisors (that's B2B's surface).

---

## 4. Goals & Success Metrics

**Product goal:** Turn Surmount strategies into an outbound-viral primitive that drives user acquisition through peer sharing.

**Success metrics:**

| Metric | What it measures | Target | Timeframe |
|---|---|---|---|
| Share rate per B2C MAU | % of monthly active users who produce ≥1 card share | ≥15% | 90 days post-launch |
| Shares per sharer | Average number of shares produced by sharers | ≥2 | 90 days post-launch |
| Install rate from shared links | Installs attributed to a shared card ÷ unique link taps | ≥5% | 90 days post-launch |
| Invest-from-shared-strategy conversion | % of installs-via-shared-card who invest in that strategy within 14 days | ≥10% | 90 days post-launch |
| K-factor | (Shares per user) × (install rate per share) | ≥0.3 | 180 days post-launch |
| Web-preview-to-install rate | % of non-user link taps who install within 7 days | ≥8% | 90 days post-launch |
| Follow rate (Story 6) | % of strategy-page viewers who follow without investing | ≥15% | 90 days post-launch |
| Social proof lift (Story 7) | Invest conversion lift when "X friends are in this" row is shown vs. hidden | +30% lift | 90 days post-launch |
| Trade-card share rate (Story 8) | % of post-trade confirmations where Maya taps Share | ≥20% | 90 days post-launch |
| Re-share rate (Story 10) | % of shared-link recipients who themselves re-share the strategy | ≥5% | 90 days post-launch |
| Video share adoption (Story 11) | % of shares using video format when it is offered | ≥40% | 60 days post-video-launch |
| Creator-followed MAU (Story 12) | % of B2C MAU with ≥1 person following their profile | ≥10% | 180 days post-launch |

**Anti-metrics (do NOT optimize for):**
- Total cards generated (without share). Generating a card that isn't shared is cost, not signal. Optimizing "preview views" would encourage prompting too aggressively.
- Share count per user beyond reason. Optimizing "shares per user" could encourage spammy re-share prompts that destroy trust.
- Time-in-app on the card creation flow. Longer time = more friction, not more quality.

**Critical assumption being tested (carried from validation):**
**A meaningful slice of active Surmount B2C users will share outward when given a tasteful tool.** If Story 1 share instrumentation shows <5% share rate among treated users within 30 days, the feature's foundation is not real and requires reframing (likely pivot to Direction C as primary, which changes the whole product).

---

## 5. Value Proposition

**For Maya (primary user):**
> Maya can finally share an investing decision she's proud of as a beautiful, branded card in 3 taps — without the cropped-screenshot cringe or the hunt for context — because Surmount Strategy Cards turn the strategy itself into the social object, annotated with Maya's own take.

**For Priya (existing-user recipient):**
> Priya can tap a friend's card and land directly on that exact strategy inside Surmount with Maya's take at the top of the page and Invest as the primary action, so a recommendation becomes a decision without hunting.

**For Alex (non-user recipient / growth):**
> Alex can preview the actual strategy content on mobile web before committing to install, and once he does install, he lands directly on that strategy — so the install action carries intent through, instead of dumping him on a generic home screen.

**Competitive differentiation:**
Robinhood Social and Public.com are internal feeds with no outbound share primitive — they cede distribution to screenshots-on-Instagram. eToro's Popular Investor program is a professional-tier copy-trading product, not a casual-sharing tool. Blossom is a standalone social app that requires users to leave their broker. Surmount Strategy Cards is the only product in the landscape that makes a broker-native strategy into a recipient-actionable outbound card for the casual 25–35 retail segment — and the moat is Surmount's strategy primitive itself (marketplace + no-code builder), which Robinhood would have to rebuild before they could copy the share system.

---

## 6. Solution & Feature Scope

### Story 1 — Maya picks a strategy worth sharing
**Persona:** Maya
**Job:** Find a clear path to share a strategy from inside Surmount without screenshots.
**Description:** From any strategy detail screen a Share pill is visible in the hero top-right. Tapping it slides up a full-screen share preview (`ShareCardScreen`) showing a 350×560 branded card. Maya can share the card image, copy a deep link, or download the card.

**Built (April 2026):**
- "Share" pill button in `StrategyHero` top-right — tapping it spring-animates `ShareCardScreen` up from the bottom
- `ShareCard` component (350×560, ~9:16): hero image + warm amber gradient overlay, strategy name at 28px, 1-year return pill, top-3 holdings bars (colored by ticker), Surmount logomark in top-left
- Tilt effect on web (RAF-based, zero React re-renders, perspective in transform string)
- Three action buttons on the preview screen:
  - **Share** — captures card via `react-native-view-shot`, invokes Web Share API (web) / `expo-sharing` (native)
  - **Copy link** — copies `https://surmount.app/s/[id]?sharedBy=Maya` to clipboard; shows "Copied!" flash for 2s
  - **Download** — triggers anchor download on web
- Card generation is on-device (no server call) — completes in <1s

**Deferred / not yet built:**
- Share entry point from portfolio/holdings list view (only strategy detail implemented)
- Card generation error/retry UI
- Real authenticated sharer name (hardcoded "Maya" for now)
- Strategy performance gating per legal guidance

**Open questions:**
- For strategies Maya built in the no-code builder, does the card show her name as author? Confirm with legal before production.
- Android share intent parity (web prototype only tested in browser).

---

### Story 4 — A Surmount-using friend taps Maya's card and can invest in one tap
**Persona:** Priya
**Job:** See the shared strategy in-app immediately, with Maya's take as context, and act.
**Description:** Tapping a shared link navigates directly to the strategy detail page, showing Maya's attribution and take at the top, with Invest as the primary CTA.

**Built (April 2026):**
- `app/strategy/[id].tsx` reads `sharedBy` and `take` URL params and passes them to `StrategyDetailScreen`
- Attribution banner rendered between the nav bar and the hero when `sharedBy` is present: brand-blue avatar circle (sharer initial) + "Shared by [Name]" label + take text below
- Footer CTA label switches from "Trade" → "Invest" when the page is loaded via a shared link
- Deep link format: `/strategy/quantum-computing-leaders?sharedBy=Maya&take=This+is+such+a+solid+strategy`

**Deferred / not yet built (production hardening):**
- iOS / Android universal link configuration (requires Apple `.well-known/apple-app-site-association` + Android asset links)
- Auth-intent preservation: if Priya is not logged in, routing her through login and landing on the same strategy page after auth
- Cold-start navigation (requires native deep link handler; currently web-only via URL params)

**Open questions:**
- Compliance requirement to disclose "shared by" attribution vs. a generic recommendation? Schedule legal review before launch.

---

### Story 5 — A friend without Surmount lands on the strategy after installing ⭐
**Persona:** Alex
**Job:** Preview the strategy on mobile web, and if he installs, land directly on it inside the app.
**Description:** Tapping a shared link without Surmount installed opens a mobile web preview showing the strategy card, Maya's attribution and take, and a "Get Surmount" CTA. A secondary link tries to open the strategy in-app for users who already have it installed.

**Built (April 2026):**
- New route `app/s/[id].tsx` → served at `/s/[id]` (e.g. `surmount.app/s/quantum-computing-leaders`)
- Page layout (top → bottom): Surmount wordmark → attribution row (avatar + "Maya shared this with you") → `ShareCard` scaled to viewport width (maintains 350:560 aspect ratio) → take block (sharer name + quoted take) → strategy name + description → CTAs → legal disclaimer
- **"Get Surmount"** — brand-blue primary button, links to App Store (placeholder URL, swap before launch)
- **"Already on Surmount? Open strategy →"** — attempts `surmount://strategy/[id]?...` deep link first; falls back to `/strategy/[id]` in-browser route
- URL params `sharedBy` and `take` flow through from the shared link to both the card and the attribution row
- Warm cream background (`#F5EDE3`) consistent with `ShareCardScreen` aesthetic
- Legal disclaimer at page bottom

**Deferred / not yet built (production hardening):**
- Deferred deep-link provider (Branch / AppsFlyer) — post-install routing to the shared strategy is not yet wired; currently Alex lands on default home after install
- Install attribution reporting (requires deep-link provider + analytics events)
- Open Graph meta tags on `/s/[id]` so the card image renders as the link preview in iMessage / Instagram
- Play Store link (Android)

**Assumption this tests:** **Deep-linked recipient conversion** — the second critical assumption. Instrumented as install rate from unique link taps and 14-day invest-from-install rate.

**Open questions:**
- Attribution window: recommend 30 days for install, 14 days for invest-from-install.
- Mobile web preview shows structure only (no performance data) — confirm with legal before adding return stats.

---

### Story 6 — Priya follows a strategy without investing
**Persona:** Priya
**Job:** Stay close to Maya's strategy without committing capital yet.
**Description:** When Priya views a strategy — especially arriving from a shared card — a Follow button sits alongside the Invest CTA. Following subscribes Priya to trade notifications for that strategy without requiring any capital commitment. It's the lowest-friction way for a recipient to stay connected after seeing a share.

**In scope:**
- Follow / Unfollow toggle on strategy detail screen
- Push notification when a followed strategy executes a new trade
- "Following" list on Priya's profile page
- Follow state persisted server-side (survives app restart)

**Out of scope (this version):**
- Following a strategy creator / person (that's Story 12)
- Commenting on trade notifications
- Custom notification frequency per strategy (always per-trade in v1)

**Acceptance criteria:**
- Given Priya is on a strategy page, when she taps Follow, then the button state changes to Following and her follow is recorded.
- Given a strategy Priya follows executes a new trade, when the trade settles, then Priya receives a push notification within 60 seconds.
- Given Priya taps Unfollow, when she returns to the strategy page, then the Follow state is cleared and notifications stop.
- Given Priya navigates to her profile, when she views her Following list, then all followed strategies appear.
- Given Priya follows a strategy without investing, when she opens it later, then the card is not in her holdings — only in her Following list.

**Open questions:**
- Should the Follow button surface elsewhere (marketplace browse, search results)? Recommend: yes, but strategy detail is the v1 entry point.
- Notification grouping: one notification per trade, or daily digest for high-frequency strategies?

---

### Story 7 — Priya sees which friends are already in a strategy
**Persona:** Priya
**Job:** Trust a strategy faster when people she knows are already invested.
**Description:** On any strategy detail page, a social proof row shows the avatars of up to 3 friends who are invested, with a label like "3 friends are in this strategy." Tapping the row expands to a list of friend names. Requires a one-time opt-in for contact sync. No dollar amounts are ever shown.

**In scope:**
- Social proof row on strategy detail screen, positioned below the hero, above the chart card
- Friend resolution via: contacts synced from address book + mutual Surmount follows
- Expandable list showing friend first names and avatars only (no holdings, no dollar amounts)
- Friend count updates nightly
- One-time opt-in prompt for contact sync (shown on first strategy view after onboarding)

**Out of scope (this version):**
- Seeing friends' allocation or dollar size in a strategy
- A full social graph or friends tab
- Appearing in the row without being invested (following without investing does not show here)

**Acceptance criteria:**
- Given Priya has synced contacts and some contacts are invested in a strategy, when she opens the strategy page, then she sees the social proof row with up to 3 avatars.
- Given zero friends are in a strategy, when Priya opens it, then the social proof row is hidden — there is no empty state.
- Given Priya taps the social proof row, when the list expands, then she sees friend names. Dollar amounts are not shown anywhere.
- Given Priya has not synced contacts, when she opens a strategy page for the first time, then she sees a one-time "See if friends are investing" opt-in prompt.
- Given a friend has not opted in to being visible, when Priya views the list, then that friend does not appear regardless of their investment.

**Open questions:**
- Privacy model: should friends need to actively opt in to being visible as "invested in strategy X", or is it opt-out? Recommend: opt-in, to avoid surprising users.
- Where does contact sync opt-in live if not at strategy page? Consider surfacing in onboarding.

---

### Story 8 — Maya shares a trade at the moment it executes
**Persona:** Maya
**Job:** Capture the emotional peak of a trade decision and share it immediately.
**Description:** Right after a buy or sell trade settles, Maya's confirmation screen includes a "Share this trade" CTA. Tapping it generates a trade card — distinct from the strategy card — showing the ticker, action (Buy / Sell), and timestamp. No dollar amounts appear on the card. The existing Story 1 share sheet handles distribution.

**In scope:**
- "Share this trade" CTA on the post-trade confirmation screen
- Trade card template: ticker name + logo, Buy/Sell label, timestamp, optional allocation-change badge (e.g. "+5% allocation")
- Reuses Story 1 share pipeline: Web Share API / native share sheet, copy link, download
- Trade cards also accessible from trade history (Maya can share old trades, not just live ones)

**Out of scope (this version):**
- Dollar amounts, P&L, or cost-basis on the trade card
- Auto-sharing trades without Maya's explicit tap
- Sharing multiple trades as a bundle / batch card

**Acceptance criteria:**
- Given Maya just executed a buy, when the confirmation screen appears, then a "Share this trade" button is visible without scrolling.
- Given Maya taps Share this trade, when the card generates, then it shows ticker, action, and timestamp — no dollar amounts appear anywhere on the card.
- Given Maya dismisses the share prompt, when she navigates to her trade history, then she can still find that trade and share it from there.
- Given Maya executes a sell, when the trade card is generated, then the framing is neutral or affirmative (e.g. "Took profits on NVDA") — not loss-framing.

**Open questions:**
- Emotional framing for Sell is harder than Buy — does "Took profits" work even when it's a loss? Needs copy design pass.
- Ticker logo source: which service? Recommend aligning with whatever Surmount already uses for holdings logos.

---

### Story 9 — Maya sees her share impact and gets notified when someone invests from her share
**Persona:** Maya
**Job:** Know that her shares are working, so she has reason to keep sharing.
**Description:** When a recipient invests in a strategy via Maya's shared card link, Maya receives a push notification: "[Name] invested in Quantum Computing Leaders from your share." She also has a "Share impact" row on her profile showing 30-day views, installs, and invests attributed to her shares. This closes the sharing loop and is the primary re-engagement hook.

**In scope:**
- Attribution tracking: shared links carry `sharedBy` param through to investment funnel
- Push notification on first attributed investment per strategy per recipient
- "Share impact" summary on Maya's profile: total views, unique link taps, installs, investments — rolling 30 days
- Recipient name shown only if they're a mutual follow; otherwise "Someone" (privacy by default)

**Out of scope (this version):**
- Monetary referral rewards for Maya
- Real-time event stream / live feed of share activity
- Per-share breakdown (aggregated 30-day stats only in v1)

**Acceptance criteria:**
- Given Priya invests in a strategy via Maya's shared link, when the trade settles, then Maya receives a push notification within 60 seconds.
- Given Priya is not a mutual follow of Maya, when Maya's notification fires, then the recipient is identified as "Someone" — not Priya's name.
- Given Maya opens her profile, when she views Share impact, then she sees total views, installs, and invests attributed to her shares over the last 30 days.
- Given Maya has no attributed investments in the last 30 days, when she views Share impact, then all metrics read 0 — no misleading blanks.

**Open questions:**
- Notification trigger: install vs. first investment vs. each investment in the attributed strategy? Recommend: first investment per strategy per recipient.
- Attribution window: 30 days (consistent with Story 5's recommendation)?

---

### Story 10 — Priya re-shares a strategy with her own take
**Persona:** Priya (now acting as sharer)
**Job:** Add her own opinion to a strategy she received and pass it to her own network.
**Description:** When Priya views a strategy she reached via a shared link, the Share button generates a new card that preserves the attribution chain ("Priya, via Maya") and lets Priya add her own optional 60-character take. Each re-share multiplies the viral coefficient: Priya's network reaches people Maya never could.

**In scope:**
- Share card on re-share shows both Priya's and Maya's attribution (2-level chain max visible)
- Optional 60-char one-liner take for Priya (reuses Story 2 input pattern)
- Re-share URL appends `via=Maya` param alongside `sharedBy=Priya`
- Re-shares tracked as a distinct event type in share analytics (separate from first-gen shares)
- Partial attribution credit: 50/50 for first 14 days, then last-touch wins

**Out of scope (this version):**
- Attribution chains deeper than 2 levels visible on card (collapse to "Priya, and 2 others" beyond that)
- Editing or removing Maya's original take on a re-share
- Chain-of-custody monetary rewards

**Acceptance criteria:**
- Given Priya arrived via Maya's shared link and taps Share, when the re-share card generates, then it shows both Priya's and Maya's attribution.
- Given Priya types a take, when the card renders, then her take is shown and Maya's original take (if present) is preserved below.
- Given a third person invests via Priya's re-shared link, when attribution is recorded, then both Priya and Maya receive credit.
- Given a chain extends beyond 2 sharers, when the card renders, then the attribution reads "Priya, and 2 others" — it does not list all names.

**Open questions:**
- 50/50 vs. last-touch attribution split: does growth or legal have a preference?
- Is the chain visible to recipients on the web preview page, or tracked in analytics only? Recommend: visible on card (builds social proof / FOMO).

---

### Story 11 — Maya shares an animated video card for TikTok and Reels
**Persona:** Maya
**Job:** Share a strategy in a format that performs on video-first social platforms.
**Description:** Alongside the static card share, Maya can choose "Share as video" to generate a 3-second looping 9:16 MP4 showing the strategy card with the holdings bars or a price chart animating in. This format is natively shareable to TikTok, Instagram Reels, and YouTube Shorts — platforms where static images consistently underperform.

**In scope:**
- "Share as video" option on the existing share screen (new tab / toggle alongside static image)
- 3-second looping MP4, 9:16 aspect ratio, retina resolution
- Animation: holdings bars reveal left-to-right, or chart line draws from left to right — one of the two, decided in design spike
- Native video share intent (iOS / Android share sheet + web)
- Separate analytics event for video shares vs. static image shares

**Out of scope (this version):**
- User-controlled animation, speed, or customization
- Voiceover or background music
- TikTok-specific API integration (standard share sheet is sufficient)
- Live-updating video (it's a snapshot at generation time)

**Acceptance criteria:**
- Given Maya on the share screen, when she taps "Share as video", then an MP4 is generated and ready to share within 5 seconds.
- Given the MP4 opens in TikTok, when Maya posts it, then it renders natively at 9:16 without letterboxing or black bars.
- Given the MP4 is shared in iMessage, when Priya receives it, then it plays inline without needing to download.
- Given video generation fails (render error), when Maya sees the result, then she sees a clear error and is offered the static image share as a fallback.

**Open questions:**
- Rendering pipeline: server-side (higher quality, infra cost, OG video preview) vs. on-device (faster, iOS AVFoundation is reliable, Android less so). **Decision required before sprint.**
- File size budget: target <2MB for iMessage inline playback. Is that achievable at retina with a 3s loop?

---

### Story 12 — Maya has a public strategy profile
**Persona:** Maya (as creator)
**Job:** Build a persistent public presence around her strategies so followers accumulate over time, independent of any individual share.
**Description:** Maya has a public profile at `/profile/[username]` — accessible on web and in-app — listing her public strategies, 1Y returns, and follower count. Anyone can follow Maya directly (separate from following an individual strategy), and gets notified when she publishes a new public strategy. The profile URL is Maya's "link in bio."

**In scope:**
- `/profile/[username]` route on web and in-app
- Lists all public strategies with name, 1Y return, and follower count
- Follow / Unfollow Maya button (person-level follow, distinct from strategy-level follow)
- Follower count displayed on Maya's profile
- Per-strategy public / private toggle (private strategies are not listed)
- Followers notified when Maya makes a strategy public
- Pre-auth follow intent preserved: if Priya is not logged in on web, clicking Follow routes her through login / install and then the follow is applied

**Out of scope (this version):**
- Profile customization (bio, banner, social links)
- Direct messaging Maya from her profile
- Paid / premium follows or subscription-gated trade alerts (Phase 4 monetization track)
- Verified performance badge (requires audit infrastructure, Phase 3)

**Acceptance criteria:**
- Given a web visitor opens `/profile/maya`, when the page loads, then they see Maya's avatar, display name, public strategies (with returns), follower count, and a Follow button — without needing to be logged in.
- Given Maya toggles a strategy to private, when her profile is loaded by anyone, then that strategy does not appear.
- Given a logged-in user taps Follow on Maya's profile, when Maya subsequently makes a new strategy public, then the follower receives a push notification.
- Given a logged-out web visitor taps Follow, when they complete the install / login flow, then their follow intent is applied and not lost.
- Given two users both follow Maya, when Maya's follower count is displayed, then it reflects the accurate total.

**Open questions:**
- Username reservation: claim on signup (proactive) or opt-in later from settings (lighter onboarding)? Recommend: opt-in from settings so signup isn't gated on username choice.
- Verified performance badge audit threshold — what return history and account age qualifies? Deferred to Phase 3 but the data model needs to be built now.

---

## 7. Constraints & Risks

**Technical constraints:**
- iOS + Android, mobile only in v1 (no iPad, no web-authored shares)
- Must integrate with existing Surmount strategy primitive (marketplace + no-code builder)
- Card rendering pipeline decision: server-side (quality + OG previews, needs image infra) vs. on-device (faster, less brand-controllable). **Decision required in week 1.**
- Deferred deep-link provider (Branch, AppsFlyer, or equivalent) must be contracted and integrated from day one — retrofitting costs weeks of missed attribution data.
- Real-time percentile computation for comparative stats is not required for v1 or Stories 6–12; revisit if leaderboard features are added to Story 12 or beyond.

**Design constraints:**
- Must respect Surmount design system tokens (surmount-design-system skill, vr9mgx3CwlKmdGujGIumRK). Never hardcode hex or pixel values.
- **Never use ALL CAPS or text-transform: uppercase anywhere** (per CLAUDE.md — absolute rule across all Surmount products).
- Body font is Geist; display font is Inter. Approved font sizes only (8, 12, 14, 16, 20, 24, 28).
- Bloomberg-terminal aesthetic — data-dense, institutional, no gratuitous decoration.
- Card identity needs a distinctive visual spike so it doesn't blend into IG Story feeds like Strava cards do.
- Accessibility: contrast, focus states, reduced-motion support on card animations.

**Data & privacy:**
- Cards embed strategy composition, not personal dollar P&L. Personal dollar amounts are not shared outbound in v1.
- Maya's "take" is user-generated content and must pass basic moderation (profanity filter at minimum).
- Install-attribution tokens must comply with iOS ATT / App Tracking Transparency and Android equivalents.
- Recipient-side analytics should not expose Priya's or Alex's identity to Maya without explicit opt-in.

**Key risks:**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Sharing assumption is wrong (<5% of MAU share within 30 days) | High | High | **Concierge test with 20 active users before full build.** ≥15% share rate = green light; <5% = reframe. Story 1 share rate is the primary instrument. |
| Comparative-stat framing triggers compliance issues | Medium | Medium (C only) | 30-min legal review before Phase 2; v1 can ship without it. |
| Recipient deep-link conversion is below K-factor threshold | Medium | High | Baseline existing Surmount referral links before build; instrument all 4 drop-off points from day one. |
| Card looks generic / blends into IG Story feeds like Strava | Medium | Medium | Dedicated visual identity spike in week 1; A/B test distinctive-vs-generic card designs. |
| Robinhood Social adds outbound share primitive in Q3 2026 | Low-Medium | High | Ship v1 before Q3 2026. |
| Negative emotional-state moments (loss-triggered cards in C) damage trust | Medium | High | Defer C entirely until v1 signal lands; design loss-framed cards with dignity if/when shipped. |

---

## 8. Release Approach

**Recommended sequence:**
1. **Sprint 1 (Week 1–2):** ~~Design — Story 1. Card rendering decision (server vs. on-device). Visual-identity spike. Concierge test of paper/static-mock card on 20 users.~~ **✓ Done** — on-device card rendering shipped; `ShareCard` (350×560), `ShareCardScreen`, tilt effect, 3 share actions.
2. **Sprint 2 (Week 3–4):** ~~Build — Story 1. Deferred-deep-link infrastructure stood up.~~ **✓ Done (prototype)** — Story 1 built. Deferred deep-link provider (Branch/AppsFlyer) still needed.
3. **Sprint 3 (Week 5–6):** ~~Build — Stories 4 and 5 in parallel. Mobile web preview page. Attribution pipeline live.~~ **✓ Done (prototype)** — Stories 4 and 5 built. Attribution pipeline and universal link config remain.
4. **Next:** Wire universal links (iOS `.well-known`, Android asset links), integrate Branch/AppsFlyer, add OG meta tags to `/s/[id]`, swap placeholder App Store URL, connect real authenticated sharer name.
5. **Soft launch (Week 7):** Release to 10% of Surmount B2C iOS users. Monitor Story 1 share rate daily.
6. **Full launch (Week 8–9):** Gate on ≥10% share rate among soft-launch cohort → 100% rollout. If <5%, pull and reframe.

**MVP definition:**
The MVP is Stories 1 + 4 + 5 on iOS, Android parity one sprint behind. This is the minimum that tests both critical assumptions (sharing willingness on the Maya side, and recipient conversion on the Alex side) with actual production traffic, not just concierge data.

**Post-v1 sequencing (Stories 6–12):** Stories 6, 7, and 8 are the fast-follow cluster — each reuses v1 infrastructure (strategy detail screen, share card, attribution param) and can ship within one sprint of v1 production hardening completing. Stories 9 and 10 require the attribution pipeline from Story 5's hardening checklist to be live first. Stories 11 and 12 are independent tracks: video rendering (Story 11) is an infra and tooling track that can run in parallel, and public profiles (Story 12) opens the creator economy surface area and should follow only after v1 share-rate signal validates the core sharing hypothesis.

**Production hardening checklist (before soft launch):**
- [ ] Universal link config — iOS `.well-known/apple-app-site-association`, Android `assetlinks.json`
- [ ] Deferred deep-link provider (Branch or AppsFlyer) — post-install routing to shared strategy
- [ ] OG meta tags on `/s/[id]` — card image as link preview in iMessage / IG / WhatsApp
- [ ] Real sharer name from authenticated user session (currently hardcoded "Maya")
- [ ] App Store + Play Store URLs in Story 5 "Get Surmount" button
- [ ] Auth-intent preservation in Story 4 (route Priya through login, land on strategy after)
- [ ] Profanity filter on any user-generated content surfaced in attribution
- [ ] Legal review of card content, attribution framing, and any return stats shown

**Post-v1 gate (Stories 6–12):**
All of Stories 6–12 are gated on v1 (Stories 1 + 4 + 5) achieving ≥5% share rate among the soft-launch cohort. Specifically:
- **≥15% MAU share rate** → build all seven post-v1 stories in sequenced order (6 → 7 → 8 → 9 → 10 → 11 → 12).
- **5–15%** → build Stories 6, 7 (recipient-side friction reduction) and 9 (feedback loop for sharers) only. Hold Stories 8, 10, 11, 12 until share rate crosses 15%.
- **<5%** → do not proceed with any post-v1 stories. Revisit the session brief and reconsider whether outbound shareability is the right bet or whether the feature needs to be reframed (e.g., internal social feed, or Direction C auto-generated moments as the primary entry point rather than a fast-follow).

**Launch considerations:**
- **Who needs to know before ship:** Legal (compliance review of card content and Maya-attribution framing), Growth (attribution infrastructure and K-factor tracking), Support (script for user questions about the share flow and data privacy).
- **Soft launch approach:** 10% of B2C iOS users for 1 week. Monitor: daily share rate, share-sheet cancellation rate, card-generation error rate. Daily standup during soft launch week.
- **First-2-weeks post-launch monitoring:**
  - Share rate per MAU (target ≥15% at 30 days)
  - Share-sheet cancellation rate (diagnostic — high cancel = friction point)
  - Install rate from shared links (target ≥5% at 90 days, but observe weekly)
  - Invest-from-shared-strategy conversion (observable from week 2)
  - Any compliance flags raised by legal or users
  - User-reported bugs and recovery paths on the mobile web preview

---

**Note on thin sections:** None. All 8 sections have full upstream context from session brief + validation + stories. The only material uncertainty is the legal read on card content (strategies, attribution, comparative stats), which is flagged throughout and should be scheduled for week 1 of the build.
