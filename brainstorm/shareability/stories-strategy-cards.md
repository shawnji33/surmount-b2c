# Stories — Strategy Cards MVP (Direction A)

**Date:** 2026-04-16
**Persona:** Maya, 28–32, tech-savvy urban professional, disposable income, explorer mindset
**JTBD:** When Maya makes an investing decision she feels smart about, she wants to share it in a way that signals taste and discovery — so she gets recognition, belongs to an investing-literate peer group, and expresses identity without looking like she's bragging.
**Source:** session-brief.md + validation-strategy-moments.md
**Scope:** MVP — Direction A only. Direction C (Moments) deferred pending A's observed share rate.

---

## Story Index

1. Maya picks a strategy worth sharing — micro — n/a (entry point)
2. Maya personalizes the card with her take — micro — tests "her pick" dependency
3. **Maya shares the card outward ⭐** — micro — tests the critical assumption (will users share?)
4. A Surmount-using friend taps Maya's card and can invest in one tap — story — n/a
5. **A friend without Surmount lands on the strategy after installing ⭐** — story — tests recipient-conversion assumption

---

## Story 1 — Maya picks a strategy worth sharing

**Persona:** Maya, 28–32, Surmount B2C user with an active portfolio
**JTBD:** When Maya makes an investing decision she feels smart about, she wants to share it in a way that signals taste and discovery.
**Direction:** A — Strategy Cards

**Story:**
As Maya,
Maya wants to find a clear way to share a strategy she likes from inside Surmount,
so that Maya doesn't have to screenshot her app and caption the thing herself.

**What this actually looks like:**
Maya is looking at a strategy — either one she built in the no-code builder, or one from the Surmount marketplace she's currently invested in. On the strategy's detail screen, a Share button is clearly visible in the header. Maya taps it and a card preview appears, generated from that strategy, in the 9:16 Instagram Story format.

**This story is done when:**
- Maya can see a Share button on any strategy she either owns or is invested in
- Tapping Share generates a card in under 2 seconds
- The card shows the strategy name, a clean holdings summary, and recognizable Surmount branding
- Maya can tell from the preview exactly what she's about to share

**Assumption this tests:** n/a (entry point — makes the rest possible)

**My honest take:**
The Share affordance has to appear in at least two places — the strategy detail screen *and* wherever Maya's investments live — because those are two different mental contexts ("the strategy I discovered" vs. "a thing I'm invested in"). Putting it in only one place cuts the share surface in half.

**Comparable products:**
- **Strava** places Share at the top of every activity — single visible primitive. Works.
- **Public.com** has no outbound share — deliberately. That's the gap we're exploiting.

---

## Story 2 — Maya personalizes the card with her take

**Persona:** Maya, 28–32, Surmount B2C user
**JTBD:** When Maya shares a strategy, she wants it to feel like *her* pick — a piece of her taste — not a generic Surmount promo.
**Direction:** A — Strategy Cards

**Story:**
As Maya,
Maya wants to add a short personal line to the card before posting,
so that her friends see Maya's voice on it, not just Surmount's template.

**What this actually looks like:**
Before sharing, the card preview has a single line of editable text — something like "Maya's take" with a placeholder that suggests the tone ("why this strategy caught my eye"). Maya taps it, types 60 characters max, and the line appears on the card in Maya's own words. She can skip it if she wants — but the default invites her to add one.

**This story is done when:**
- Maya sees a clear prompt to add a one-liner before she shares
- The character limit is visible and friendly (e.g., "60 left")
- Maya's line appears on the card in a legible, branded position
- If Maya skips it, the card falls back to a neutral default that doesn't look broken

**Assumption this tests:** The "her pick" copywriting dependency from Check 1 of validation. If Maya routinely skips the take line, the card feels generic and her cohort won't adopt it as a personal-identity object.

**My honest take:**
The 60-character limit is a design lever. Too short = tweet-trivial; too long = it starts looking like a caption on an article. Prototype three limits (40 / 60 / 90) with real users before locking it. This one detail is disproportionately important for whether Direction A feels like Maya's or Surmount's.

**Comparable products:**
- **Spotify Wrapped** doesn't let you edit the card — and it still works because the data is personal enough. Our equivalent personal-data layer is the "take," because the underlying strategy may not be unique to Maya.
- **Instagram Stories** sticker text — users expect text-over-image in this channel, so it's a familiar mental model.

---

## Story 3 — Maya shares the card outward ⭐

**Persona:** Maya, 28–32, Surmount B2C user
**JTBD:** When Maya has her card personalized, she wants to get it onto the platform her friends already see her on, in one tap.
**Direction:** A — Strategy Cards

**Story:**
As Maya,
Maya wants to send the card to Instagram Story, iMessage, or copy the link,
so that Maya can actually post the thing where her people will see it.

**What this actually looks like:**
Maya taps Share on the card preview. The native iOS share sheet appears with the card image (9:16) already attached. Instagram Story, Messages, WhatsApp, and Copy Link are the visible options. Tapping Instagram opens a Story draft with the card pre-placed — Maya can add stickers or music, then post. Tapping Messages opens iMessage with the card image and a short link pre-filled. Tapping Copy Link copies a shareable URL that, when opened, previews beautifully (Open Graph image = the card).

**This story is done when:**
- Maya can send the card to Instagram Story in no more than 3 taps from the strategy screen
- The card image is the correct 9:16 resolution and not pixelated on modern phones
- The copy-link option produces a URL whose social preview image is the card itself
- If Maya cancels the share sheet, the card state is preserved so she doesn't start over

**Assumption this tests:** **The critical assumption from validation — will a meaningful slice of active Surmount B2C users actually share outward when given a tasteful tool?** If fewer than 15% of the concierge-test cohort completes this story within 7 days, the feature's foundation is not real and we reframe.

**My honest take:**
This is the story that determines whether the feature ships or doesn't. Everything upstream (Story 1, 2) is setup; everything downstream (Story 4, 5) is payoff. Invest disproportionately in the *speed* of this flow — from Share tap to posted-Story should feel instant. Any loading spinner, card-generation delay, or "are you sure?" confirmation is friction that cuts the share rate. Also: the 9:16 IG Story card is the primary format; don't over-invest in a 1:1 square version in v1.

**Comparable products:**
- **Strava** "Share to Instagram Stories" — generates the image, opens Stories, done. The design bar for friction-free outbound share. We should match or beat this.
- **Spotify Wrapped** 9:16 vertical + pre-placed Story — same pattern, same reason it went viral.

---

## Story 4 — A Surmount-using friend taps Maya's card and can invest in one tap

**Persona:** Priya, 29, already has Surmount installed, follows Maya on Instagram
**JTBD:** When Priya sees a strategy from someone she trusts, she wants to understand it quickly and invest in it without hunting for where it lives in the app.
**Direction:** A — Strategy Cards

**Story:**
As Priya,
Priya wants to tap Maya's card and land on that exact strategy inside Surmount,
so that Priya can decide and invest without having to remember the strategy name and search for it.

**What this actually looks like:**
Priya is scrolling Instagram Stories and sees Maya's card. She taps the "See more" or swipe-up link. Surmount opens directly on that strategy's detail page — same screen Maya was looking at — with "Invest" as the primary action. Maya's one-line take is shown at the top of the page so Priya sees the human context before the numbers. If Priya invests, the flow is the same as any other strategy invest flow — no new steps.

**This story is done when:**
- Tapping the card link from IG Story opens Surmount directly to the correct strategy page
- Priya sees Maya's take at the top of the strategy page, not buried
- The "Invest" button is the primary action on the page
- If Surmount is backgrounded (not cold-start), the deep link resolves in under a second

**Assumption this tests:** n/a (but: Maya's take being surfaced to Priya is what makes this share feel like a recommendation, not a random promo — design call worth getting right)

**My honest take:**
The "Maya's take" surfacing on the recipient side is the detail that converts a share from ad-feeling to friend-feeling. Without it, the strategy page looks exactly like it would if Priya had found it herself, and the social-proof value of the share disappears. Make sure the recipient-side persistence of Maya's take is treated as a first-class design element, not an afterthought.

**Comparable products:**
- **Letterboxd** shows "recommended by [friend]" prominently on movie pages when you arrive via share. Works because the friend's endorsement changes how you read the same content.
- **Robinhood Social** (March 2026 beta) shares profiles but has no outbound share primitive — so Priya would never see Maya's recommendation outside the app. That's the gap.

---

## Story 5 — A friend without Surmount lands on the strategy after installing ⭐

**Persona:** Alex, 27, doesn't have Surmount yet, sees Maya's card on Instagram
**JTBD:** When Alex is curious about a specific strategy he saw from a friend, he wants to see what it is without committing to anything, and if he's interested, install the app and get to that exact strategy without starting from scratch.
**Direction:** A — Strategy Cards

**Story:**
As Alex,
Alex wants to see the strategy content on the web first, then if he installs, land on that same strategy inside the app,
so that Alex doesn't have to install blindly and then search for what Maya sent him.

**What this actually looks like:**
Alex taps Maya's card link. Because he doesn't have Surmount, he lands on a mobile web page that shows the same strategy — name, Maya's take, a readable summary of the holdings, and a prominent "Get Surmount to invest in this" button. When Alex taps that button, he's sent to the App Store with a deferred deep link. After installing and opening Surmount the first time, his onboarding completes and he's dropped directly onto that strategy's page, with Maya's take still visible at the top.

**This story is done when:**
- Tapping the card link without Surmount installed shows a readable web strategy preview with Maya's take
- The preview has a single, clear "Get Surmount" call to action
- Install attribution persists through the App Store handoff (Branch, AppsFlyer, or equivalent)
- After onboarding, Alex's first in-app screen is Maya's strategy, not the default home
- If Alex abandons install and returns later, opening the link again still works

**Assumption this tests:** **Deep-linked recipient conversion — the second critical assumption.** This is where the viral-loop math lives. If the install-from-share rate is below the k-factor threshold (to be set by the metrics framework), the business case for Direction A is retention-only, not growth.

**My honest take:**
This is the hardest story to build well and the single highest-leverage one for the business. The four drop-off points — tap → web preview → App Store → install → onboard → strategy page — compound multiplicatively, so each one has to be aggressively optimized. The web preview deserves real design investment: if it's a broken-looking fallback, Alex will bounce before hitting the App Store. Engineering needs deferred-deep-link attribution infrastructure in place from day one — retrofitting it after launch costs you weeks of missed attribution data and the ability to actually measure K.

**Comparable products:**
- **TikTok's web-to-app flow** — tapping a shared TikTok link on mobile web plays the video in a beautiful web player with a persistent "Open in App" CTA. After install, the specific video loads. Best-in-class for preserving intent through install.
- **Blossom** — has deep links between its own users but operates outside brokers, so there's no "invest in this now" terminal action. We have that action, which is the point.
- **Robinhood Screenshots Instagram** — proves the demand (people are already posting investing content) but the screenshots have no deep link at all, which means zero recipient conversion. We're fixing exactly that.

---

## Handoff

The story to start with is **Story 3 — Maya shares the card outward**. It's the smallest surface that tests the critical assumption (will users share?), so you'll learn the most from designing it first. Stories 1 and 2 are necessary dependencies, so design them in the same sprint, but instrument Story 3 as the signal.

Stories 4 and 5 can begin in parallel once Story 3's flow is locked — they don't block each other. Story 5 should be designed by someone comfortable with deferred-deep-link attribution and install funnels, not just the in-app surface.

A few things surfaced while writing these that might be worth flagging:
- Where Maya's take *actually renders* on the recipient's strategy page (Story 4) is a design call that affects how share-y the feature feels. Worth a quick design-jam.
- The web preview fidelity in Story 5 has a quality-vs-scope tradeoff that warrants a leadership conversation before story-writing — is it a real strategy preview (needs back-end) or a stylized landing page (pure frontend)?
- Direction C's trigger catalog will be easier to design once Story 3's instrumentation tells us *which strategies* people actually share. That's a pattern the Moments direction should absorb.
