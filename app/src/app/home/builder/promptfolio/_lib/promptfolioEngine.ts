import { ASSET_UNIVERSE } from '../../_data';
import { PROMPTFOLIO_TEMPLATES, QUICK_START_TOPICS, type PromptfolioDraft, type PromptfolioTemplate } from '../_data';

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Exact topic-id lookup first (quick-start pill path), then a leading "/topic-id" slash command
// (composer's slash-command menu inserts these), then keyword match on typed text (first match
// wins, order matters in PROMPTFOLIO_TEMPLATES), then the generic fallback. Pure function — no
// state, no side effects, matching home/agents/page.tsx's own prompt-to-demo-config approach.
export function matchTemplate(input: string): PromptfolioTemplate {
  const trimmed = input.trim();

  const byId = PROMPTFOLIO_TEMPLATES.find((t) => t.id === trimmed);
  if (byId) return byId;

  const slash = /^\/([\w-]+)/.exec(trimmed);
  if (slash) {
    const bySlash = PROMPTFOLIO_TEMPLATES.find((t) => t.id === slash[1]);
    if (bySlash) return bySlash;
  }

  const lower = trimmed.toLowerCase();
  const byKeyword = PROMPTFOLIO_TEMPLATES.find((t) => t.matches.some((kw) => lower.includes(kw)));
  if (byKeyword) return byKeyword;

  const generic = PROMPTFOLIO_TEMPLATES.find((t) => t.id === 'generic');
  if (!generic) throw new Error('promptfolioEngine: generic template missing from PROMPTFOLIO_TEMPLATES');
  return generic;
}

// Quick-start pills submit a topic id, not a sentence — this turns that id back into readable
// text so the transcript still shows a natural-sounding user message either way. Free-typed text
// (including slash commands and @ mentions) is shown verbatim, since that's what the user actually
// typed.
export function describeInput(input: string): string {
  const topic = QUICK_START_TOPICS.find((t) => t.id === input);
  return topic ? topic.description : input;
}

const MENTION_RE = /@([A-Za-z]{1,5})\b/g;

// Grounds the composer's @ mention menu in something real and also recognizes explicit asset
// names/tickers in natural-language follow-ups (for example, "add Robinhood" → HOOD).
export function extractMentionedTickers(input: string): string[] {
  const found: string[] = [];
  let match: RegExpExecArray | null;
  MENTION_RE.lastIndex = 0;
  while ((match = MENTION_RE.exec(input))) {
    const ticker = match[1].toUpperCase();
    if (!found.includes(ticker) && ASSET_UNIVERSE.some((a) => a.ticker === ticker)) {
      found.push(ticker);
    }
  }

  const normalized = input.toLowerCase();
  ASSET_UNIVERSE.forEach((asset) => {
    const primaryName = asset.name.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '');
    const tickerMentioned = asset.ticker.length > 1
      && new RegExp(`\\b${asset.ticker.toLowerCase()}\\b`).test(normalized);
    const nameMentioned = normalized.includes(asset.name.toLowerCase())
      || (primaryName.length >= 4 && new RegExp(`\\b${primaryName}\\b`).test(normalized));
    if ((tickerMentioned || nameMentioned) && !found.includes(asset.ticker)) found.push(asset.ticker);
  });

  return found;
}

// Weaves requested tickers into a draft — each reserves a flat 15% (capped at 45% combined), and
// the existing rows scale down proportionally. Initial builds lead with requested assets; follow-up
// edits append them so the inserted table row has an obvious, stable transition target.
export function mergeMentionedTickers(
  draft: PromptfolioDraft,
  mentioned: string[],
  placement: 'before' | 'after' = 'before',
): PromptfolioDraft {
  const missing = mentioned.filter((ticker) => !draft.rows.some((r) => r.ticker === ticker));
  if (missing.length === 0) return draft;

  const PER_MENTION = 15;
  const reserved = Math.min(45, PER_MENTION * missing.length);
  const scale = (100 - reserved) / 100;

  const scaledRows = draft.rows.map((r) => ({ ticker: r.ticker, weight: round2(r.weight * scale) }));
  const mentionWeight = round2(reserved / missing.length);
  const mentionRows = missing.map((ticker) => ({ ticker, weight: mentionWeight }));

  const rows = placement === 'after'
    ? [...scaledRows, ...mentionRows]
    : [...mentionRows, ...scaledRows];
  const drift = round2(100 - rows.reduce((sum, r) => sum + r.weight, 0));
  const correctionIndex = placement === 'after' ? rows.length - 1 : 0;
  if (drift !== 0) rows[correctionIndex] = {
    ...rows[correctionIndex],
    weight: round2(rows[correctionIndex].weight + drift),
  };

  return { ...draft, rows };
}

const GENERATED_IDENTITIES = [
  {
    matches: ['warren', 'buffett', 'berkshire'],
    name: 'Quality Compounders',
    focus: 'Quality-focused businesses with durable moats and resilient cash flows',
  },
  {
    matches: ['cathie', 'wood', 'ark', 'disruptive'],
    name: 'Disruptive Innovation Growth',
    focus: 'Long-duration growth exposure to disruptive technology leaders',
  },
  {
    matches: ['pension', 'institutional'],
    name: 'Institutional Balance',
    focus: 'Institutional diversification designed for steady long-term compounding',
  },
  {
    matches: ['hedge fund', 'aggressive', 'high risk', 'high-risk'],
    name: 'Opportunistic Alpha',
    focus: 'High-conviction growth exposure built for asymmetric upside',
  },
  {
    matches: ['artificial intelligence', ' ai ', 'ai-', 'technology', 'tech'],
    name: 'AI & Technology Leaders',
    focus: 'Technology platforms and infrastructure positioned for durable growth',
  },
  {
    matches: ['retirement', 'long term', 'long-term', 'balanced'],
    name: 'Long-Horizon Balanced Core',
    focus: 'A balanced core designed for resilient long-term growth',
  },
  {
    matches: ['low risk', 'low-risk', 'conservative', 'capital preservation'],
    name: 'Steady Growth Reserve',
    focus: 'Capital preservation with measured participation in market growth',
  },
  {
    matches: ['esg', 'sustainable', 'sustainability'],
    name: 'Sustainable Leaders',
    focus: 'Diversified market leaders aligned with long-term sustainability themes',
  },
] as const;

// The prototype has no model backend, so unmatched free-form prompts receive a deterministic
// generated identity from the prompt's intent plus the portfolio that was actually assembled.
export function generateStrategyIdentity(input: string, draft: PromptfolioDraft): PromptfolioDraft {
  const normalized = ` ${input.trim().toLowerCase()} `;
  const identity = GENERATED_IDENTITIES.find((candidate) => (
    candidate.matches.some((keyword) => normalized.includes(keyword))
  ));
  const leaders = draft.rows.slice(0, 3).map((row) => row.ticker).join(', ');
  const cadence = draft.rules.rebalance.enabled
    ? `rebalanced every ${draft.rules.rebalance.every} ${draft.rules.rebalance.unit.toLowerCase()}`
    : 'managed without automatic rebalancing';

  return {
    ...draft,
    name: identity?.name ?? 'Adaptive Market Core',
    description: `${identity?.focus ?? 'A diversified mix of growth and defensive exposure'}, led by ${leaders} and ${cadence}.`,
  };
}
