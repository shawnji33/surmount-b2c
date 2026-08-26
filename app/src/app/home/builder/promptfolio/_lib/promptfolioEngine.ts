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

type DraftRevision = {
  draft: PromptfolioDraft;
  addedTickers: string[];
  removedTickers: string[];
  summary: string;
  assistantReply: string;
};

function normalizeRows(
  rows: PromptfolioDraft['rows'],
  lockedTicker?: string,
  lockedWeight?: number,
) {
  if (rows.length === 0) return rows;
  if (rows.length === 1) return [{ ...rows[0], weight: 100 }];

  const locked = lockedTicker ? rows.find((row) => row.ticker === lockedTicker) : undefined;
  const target = locked ? Math.max(0, Math.min(100, round2(lockedWeight ?? locked.weight))) : 0;
  const flexible = locked ? rows.filter((row) => row.ticker !== locked.ticker) : rows;
  const available = locked ? 100 - target : 100;
  const flexibleTotal = flexible.reduce((sum, row) => sum + row.weight, 0);
  const scaled = flexible.map((row) => ({
    ...row,
    weight: round2(flexibleTotal > 0
      ? (row.weight / flexibleTotal) * available
      : available / flexible.length),
  }));
  const drift = round2(available - scaled.reduce((sum, row) => sum + row.weight, 0));
  if (scaled[0]) scaled[0] = { ...scaled[0], weight: round2(scaled[0].weight + drift) };

  return rows.map((row) => (
    locked && row.ticker === locked.ticker
      ? { ...row, weight: target }
      : scaled.find((candidate) => candidate.ticker === row.ticker) ?? row
  ));
}

function requestedWeight(input: string, ticker: string) {
  const asset = ASSET_UNIVERSE.find((candidate) => candidate.ticker === ticker);
  const labels = [ticker, asset?.name, asset?.name.split(/\s+/)[0]].filter(Boolean) as string[];
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const after = new RegExp(`\\b${escaped}\\b[^%\\d]{0,8}(\\d{1,3}(?:\\.\\d+)?)\\s*%`, 'i').exec(input);
    if (after) return Number(after[1]);
    const before = new RegExp(`(\\d{1,3}(?:\\.\\d+)?)\\s*%[^a-z0-9]{0,12}\\b${escaped}\\b`, 'i').exec(input);
    if (before) return Number(before[1]);
  }
  return null;
}

// Follow-up prompts revise the live draft instead of selecting a fresh template. This intentionally
// covers the high-value deterministic edits in the prototype: add/remove a holding, set a target
// weight, and adjust risk/rebalancing rules. Unrecognized copy still becomes a recorded refinement
// without wiping out the portfolio the user is looking at.
export function applyDraftRevision(current: PromptfolioDraft, input: string): DraftRevision {
  const normalized = input.toLowerCase();
  const mentioned = extractMentionedTickers(input);
  const removeIntent = /\b(remove|drop|exclude|sell|delete|without)\b/i.test(input);
  const removedTickers = removeIntent
    ? mentioned.filter((ticker) => current.rows.some((row) => row.ticker === ticker))
    : [];
  const addCandidates = removeIntent ? [] : mentioned;
  const addedTickers = addCandidates.filter((ticker) => !current.rows.some((row) => row.ticker === ticker));
  const changes: string[] = [];

  let draft: PromptfolioDraft = {
    ...current,
    rows: current.rows.map((row) => ({ ...row })),
    rules: {
      rebalance: { ...current.rules.rebalance },
      stopLoss: { ...current.rules.stopLoss },
      takeProfit: { ...current.rules.takeProfit },
    },
  };

  if (removedTickers.length > 0) {
    draft = { ...draft, rows: normalizeRows(draft.rows.filter((row) => !removedTickers.includes(row.ticker))) };
    changes.push(`removed ${removedTickers.join(', ')}`);
  }

  if (addedTickers.length > 0) {
    draft = mergeMentionedTickers(draft, addedTickers, 'after');
    changes.push(`added ${addedTickers.join(', ')}`);
  }

  mentioned.forEach((ticker) => {
    if (!draft.rows.some((row) => row.ticker === ticker)) return;
    const weight = requestedWeight(input, ticker);
    if (weight === null) return;
    draft = { ...draft, rows: normalizeRows(draft.rows, ticker, weight) };
    changes.push(`set ${ticker} to ${Math.max(0, Math.min(100, weight))}%`);
  });

  const stopLossValue = /stop[- ]?loss[^%\d]{0,20}(\d{1,3}(?:\.\d+)?)\s*%/i.exec(input)?.[1];
  const stopLossOff = /\b(?:disable|remove|no|without|turn off)\b[^.]{0,24}stop[- ]?loss|stop[- ]?loss[^.]{0,24}\b(?:off|disabled)\b/i.test(input);
  if (stopLossOff) {
    draft.rules.stopLoss.enabled = false;
    changes.push('disabled the stop loss');
  } else if (stopLossValue) {
    draft.rules.stopLoss = { enabled: true, percent: Math.min(100, Number(stopLossValue)) };
    changes.push(`set the stop loss to ${draft.rules.stopLoss.percent}%`);
  }

  const takeProfitValue = /take[- ]?profit[^%\d]{0,20}(\d{1,3}(?:\.\d+)?)\s*%/i.exec(input)?.[1];
  const takeProfitOff = /\b(?:disable|remove|no|without|turn off)\b[^.]{0,24}take[- ]?profit|take[- ]?profit[^.]{0,24}\b(?:off|disabled)\b/i.test(input);
  if (takeProfitOff) {
    draft.rules.takeProfit.enabled = false;
    changes.push('disabled take profit');
  } else if (takeProfitValue) {
    draft.rules.takeProfit = { enabled: true, percent: Math.min(100, Number(takeProfitValue)) };
    changes.push(`set take profit to ${draft.rules.takeProfit.percent}%`);
  }

  const cadence = /every\s+(\d+)\s*(day|week|month)s?/i.exec(input);
  const namedCadence = normalized.includes('quarterly')
    ? { every: 3, unit: 'Months' as const }
    : normalized.includes('monthly')
      ? { every: 1, unit: 'Months' as const }
      : normalized.includes('weekly')
        ? { every: 1, unit: 'Weeks' as const }
        : normalized.includes('daily')
          ? { every: 1, unit: 'Days' as const }
          : null;
  if (/\b(?:disable|remove|no|without|turn off)\b[^.]{0,24}rebalanc/i.test(input)) {
    draft.rules.rebalance.enabled = false;
    changes.push('disabled automatic rebalancing');
  } else if (cadence || namedCadence) {
    const unit = cadence
      ? `${cadence[2][0].toUpperCase()}${cadence[2].slice(1).toLowerCase()}s` as 'Days' | 'Weeks' | 'Months'
      : namedCadence!.unit;
    const every = cadence ? Math.max(1, Number(cadence[1])) : namedCadence!.every;
    draft.rules.rebalance = { enabled: true, every, unit };
    changes.push(`rebalances every ${every} ${unit.toLowerCase()}`);
  }

  const summary = changes.length > 0 ? changes.join(', ') : 'refined the current draft';
  return {
    draft,
    addedTickers,
    removedTickers,
    summary,
    assistantReply: changes.length > 0
      ? `Done — I ${summary}. The rest of the draft stays unchanged.`
      : 'I kept the current portfolio intact and recorded this direction for the next refinement.',
  };
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
