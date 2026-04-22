# Idea Validation — Strategy Cards + Moments (A + C)

**Date:** 2026-04-16
**Source:** session-brief.md (Designer Brainstorm Kit, Phase 2)

## Direction Validated

A shared 9:16 card system for Surmount B2C mobile. **Direction A** makes strategies shareable as the viral-loop social object (recipient-actionable deep link). **Direction C** auto-generates identity cards on milestones for engagement + retention. A and C share a common card-rendering infrastructure.

## User & JTBD

**Persona:** Maya, 28–32, tech-savvy urban professional, disposable income, explorer mindset
**JTBD:** When Maya makes an investing decision she feels smart about, she wants to share it in a way that signals taste and discovery — so she gets recognition, belongs to an investing-literate peer group, and expresses identity without looking like she's bragging.

## Validation Results

### User–Direction Fit
A serves Maya's top three opportunities (share outward, strategy travels, recognition for taste). C serves opportunities 3 and 4 (tastemaker credit, non-cringe celebration). Live risk: Maya's ownership of a Surmount-curated strategy requires copy/UX that frames it as "her pick" rather than "Surmount's pick."
**Status: ✅ Strong** (with a copywriting dependency).

### JTBD Integrity
A reverses the screenshot workaround — the card carries structure and recipient-action. C specifically threads the "without bragging" clause: the app frames the achievement, Maya just forwards it. No adjacent product completes this JTBD adequately for Maya's cohort.
**Status: ✅ Strong.**

### Critical Assumption
**A meaningful slice of active Surmount B2C MAU will share outward when given a tasteful tool.**
- Risk type: Value
- Confidence: Low (Shawn has admitted limited signal on actual user group)
- Cheapest test: Concierge — static-mocked card, 20 active users, measure observed share within 7 days. Target: ≥15% share rate. <5% = reframe required.

**Second most critical:**
**Comparative stats can be framed within regulatory bounds.**
- Risk type: Viability / Trust
- Confidence: Low
- Cheapest test: 30-min legal review — binary outcome.

### Full Assumption Stress-Test

| Assumption | Risk type | Confidence | Cheapest test |
|---|---|---|---|
| Meaningful slice of Surmount B2C MAU will share outward if tool is tasteful | Value | Low | Concierge test with 20 active users |
| Maya treats Surmount strategy as "her pick" given "Maya's take" annotation | Value / Trust | Low | Two-variant qualitative test with 10 users |
| Deep-linked recipient flow converts at economical rates | Viability | Low | Model k-factor; instrument existing referral links to baseline install-from-share |
| Comparative stats can be framed within regulatory bounds | Viability / Trust | Low | 30-min legal review |
| 9:16 card generation at mobile quality is buildable in reasonable time | Feasibility | Medium | 3-day engineering spike |
| Moments triggers feel earned, not gamified | Value / Usability | Low-Medium | Hallway-test 10 candidate triggers with 5 target users |

### Differentiation
The unoccupied space: **strategy-first outbound card with recipient-actionable deep link, built inside the broker, tuned for casual sharing, with an always-on Wrapped-style moments layer.** Defensible moat: Surmount's strategy primitive (marketplace + no-code builder) is not something Robinhood has — they'd need to build a strategy construct before they could copy the share system. Window: ~6–12 months before Robinhood Social adds outbound primitives.
**Status: ✅ Clear.**

## Verdict

**⚠️ Direction holds with conditions.**

The bet is fundamentally sound — user/JTBD alignment is strong, differentiation is specific and defensible, viral-loop framing is correct. Two conditions must be met before committing engineering to the full A+C build:

1. **De-risk the sharing assumption** with a concierge test (≥15% of 20 active users share within 7 days).
2. **Legal read on comparative-stat framing** before locking Moments trigger catalog.

If both clear, proceed to stories for A as the MVP; C is a fast-follow dependent on A's share-rate signal.

## Persona Critique

### Design + Engineering

1. **Card identity is the make-or-break design problem.** Generic cards blend into IG Story feeds. Needs a visual identity spike before story-writing — distinctively Surmount at a glance.
2. **Empty state in A is fragile.** First-time users with no built or invested strategy — what does their Share surface show? Most-skipped design problem in the kit.
3. **Negative-framed moments are an emotional-states landmine.** What happens when Maya's card is triggered by being down 30%? We need to decide: suppress, or design loss-framed cards with dignity. Before engineering builds the trigger engine.
4. **Recipient deep-link flow has ~4 drop-off points** (tap → app-store → install → open → strategy). Biggest design investment should go here, not into the card.
5. **9:16 card rendering: server-side or on-device?** Pick early; it shapes the whole build and the shareable-link preview story.
6. **Comparative stats are a data-engineering lift.** Real-time percentile computation with eligibility filters is non-trivial infra.

### Leadership

1. **K-factor math before funding.** Model share rate × install rate × invest rate. Need credible K > 0.3 projection or this is retention dressed as growth.
2. **Ship Direction A only. MVP in 6 weeks, not a quarter.** Do not bundle A and C.
3. **Competitive clock: 6–12 months.** Robinhood Social is in 1k-user beta. If they ship outbound cards in Q3 2026, our window closes. Ship before then.
4. **The moat is the strategy primitive, not the card.** v1 design must showcase marketplace and no-code builder — those are what Robinhood would have to rebuild to copy.
5. **Metrics framework committed before design:** share rate per MAU (30d), installs-from-shared-cards (90d), invest-from-shared-strategy conversion (90d), k-factor (180d). Numeric targets, not narratives.
6. **Risk concentration on sharing-behavior assumption is high.** Define Plan B now if ≤5% of testers share.

### Synthesis

**Where they agree:**
- Scope MVP tightly — ship A alone, gate C on A's share-rate signal. Design+Eng wants this because C's edge cases (negative moments, trigger catalog) need more thought. Leadership wants this because K-factor is the only thing that matters. Both right.
- The recipient deep-link flow is where the business case lives. Design+Eng counts 4 drop-off points; Leadership frames it as install conversion. Same concern, two angles. This is the single most important flow to design and instrument.

**The core tension:**
Design+Eng wants craft time for card identity, emotional-state design, and flow polish. Leadership wants speed to K-factor signal. One side optimizes for "will this work well?"; the other for "will this work *at all*?" Recommended resolution: put craft investment into the recipient flow (where both agree the business case lives), keep the card itself clean-but-generic for v1, earn the card-identity investment after K-factor clears.

**The one question to answer before stories:**
> **What is the smallest, narrowest slice of Direction A that tests the sharing-behavior and recipient-conversion assumptions in a single 6-week build?**

## Recommended Next Step

Proceed to Feature Story Writer, scoped to the **Direction A MVP** only. Stories must explicitly address:
- Critical assumption #1 (will users share?) — observable in story #1 (core share flow)
- Critical assumption #2 (will recipients convert?) — observable in the recipient-side story
- "Her pick" copywriting dependency from Check 1
- Recipient deep-link drop-off risk (design craft concentrated here)

Direction C enters the story writer on a follow-up cycle once A ships and share-rate signal is observed (≥15% of MAU producing ≥1 share/quarter = proceed; <5% = reframe).
