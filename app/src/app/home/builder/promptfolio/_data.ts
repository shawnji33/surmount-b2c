import { TrendDown, Broom, Scales, Receipt, ShieldCheck, ArrowsClockwise, type Icon } from '@phosphor-icons/react';
import type { AllocationRow, RuleState } from '../_shared/types';

export type QuickStartTopic = {
  id: string;
  name: string;
  description: string;
  icon: Icon;
};

// Same taxonomy as the unshipped playground/agent-home exploration's ROLE_TEMPLATES. No longer
// rendered as a standalone pill row on the hero (removed per design feedback) — now surfaces as
// slash commands inside the composer's "+" menu (see PromptComposer.tsx).
export const QUICK_START_TOPICS: QuickStartTopic[] = [
  { id: 'dip-buyer', name: 'Dip-Buyer', description: 'Buy when a stock drops below a threshold', icon: TrendDown },
  { id: 'cash-sweeper', name: 'Cash Sweeper', description: 'Move idle cash into higher-yield accounts automatically', icon: Broom },
  { id: 'rebalancer', name: 'Rebalancer', description: 'Keep your portfolio at target allocation', icon: Scales },
  { id: 'tax-harvester', name: 'Tax Harvester', description: 'Capture losses to offset gains, automatically', icon: Receipt },
  { id: 'hedge-agent', name: 'Hedge Agent', description: 'Protect your portfolio when volatility spikes', icon: ShieldCheck },
  { id: 'dividend-reinvestor', name: 'Dividend Reinvestor', description: 'Automatically reinvest dividends as they arrive', icon: ArrowsClockwise },
];

export type PromptCategory = {
  id: string;
  label: string;
  prompts: string[];
};

// Ported verbatim (copy + category set) from designs/create/promptfolio.html's PROMPT_DATA — the
// "Try recommended prompts" card below the composer.
export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'persona',
    label: 'Investor persona',
    prompts: [
      'Build me a portfolio like Warren Buffett',
      'Invest like Cathie Wood (disruptive tech)',
      'Portfolio like a pension fund manager',
      'Hedge fund-style aggressive bets',
    ],
  },
  {
    id: 'theme',
    label: 'Theme or sector',
    prompts: [
      'Invest in GLP-1s',
      'Companies that benefit from Gen-Z consumer habits',
      'Companies with lots of users, but low ARPU',
      'Invest in self-driving automations',
    ],
  },
  {
    id: 'risk',
    label: 'Risk profile',
    prompts: [
      'Low risk, steady income portfolio',
      'Moderate growth with downside protection',
      'High risk, high reward — all in',
      'Capital preservation first',
    ],
  },
  {
    id: 'goal',
    label: 'Goal-based',
    prompts: [
      'Save for retirement in 20 years',
      'Build a college fund for my child',
      'Generate passive income now',
      'Grow wealth aggressively short-term',
    ],
  },
  {
    id: 'geo',
    label: 'Geography',
    prompts: [
      'US-only large cap leaders',
      'Emerging markets with high growth',
      'European dividend stocks',
      'Asia Pacific technology exposure',
    ],
  },
  {
    id: 'asset',
    label: 'Asset class',
    prompts: [
      'All equities, no bonds',
      'Balanced portfolio (60/40)',
      'Real estate investment trusts (REITs)',
      'Commodities and inflation hedges',
    ],
  },
  {
    id: 'values',
    label: 'Values and interests',
    prompts: [
      'ESG and sustainable investing',
      'Companies that Andreessen Horowitz invested in',
      'B2B companies with notably high revenue per employee',
      'Invest in companies that run Superbowl ads',
    ],
  },
];

export type PromptfolioDraft = {
  name: string;
  description: string;
  rows: AllocationRow[];
  rules: RuleState;
};

export type PromptfolioTemplate = {
  /** Matches a QUICK_START_TOPICS id for direct pill lookup, or 'generic' for the free-text
   * fallback used when nothing in `matches` hits. */
  id: string;
  /** Keyword fragments checked (in order) against a lowercased typed prompt — first match wins. */
  matches: string[];
  assistantReply: string;
  draft: PromptfolioDraft;
};

// One canned outcome per quick-start topic, plus a generic fallback for free-typed prompts that
// don't match anything — deliberately scripted (no backend), same convention as
// home/agents/page.tsx's own prompt-to-demo-config pattern matching. All tickers are real entries
// in ASSET_UNIVERSE.
export const PROMPTFOLIO_TEMPLATES: PromptfolioTemplate[] = [
  {
    id: 'dip-buyer',
    matches: ['dip', 'drop', 'buy the dip', 'discount', 'pullback'],
    assistantReply: "Got it — I'll draft a dip-buying strategy leaning into volatile growth names with room to average in, plus a stop-loss so a bad dip doesn't turn into a bigger loss.",
    draft: {
      name: 'Dip-Buyer',
      description: 'Buys volatile growth names on pullbacks, with a stop-loss to cap downside',
      rows: [
        { ticker: 'NVDA', weight: 35 },
        { ticker: 'AMD', weight: 25 },
        { ticker: 'TSLA', weight: 25 },
        { ticker: 'PLTR', weight: 15 },
      ],
      rules: {
        rebalance: { enabled: true, every: 30, unit: 'Days' },
        stopLoss: { enabled: true, percent: 25 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
  {
    id: 'cash-sweeper',
    matches: ['cash', 'sweep', 'idle', 'high-yield', 'savings'],
    assistantReply: "On it — I'll build a steady, diversified core with weekly rebalancing, so idle cash never sits still for long.",
    draft: {
      name: 'Cash Sweeper',
      description: 'A diversified core that rebalances weekly to keep idle cash working',
      rows: [
        { ticker: 'VTI', weight: 30 },
        { ticker: 'VOO', weight: 30 },
        { ticker: 'JPM', weight: 20 },
        { ticker: 'KO', weight: 20 },
      ],
      rules: {
        rebalance: { enabled: true, every: 7, unit: 'Days' },
        stopLoss: { enabled: false, percent: 30 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
  {
    id: 'rebalancer',
    matches: ['rebalance', 'allocation', 'target weight', 'drift'],
    assistantReply: "Here's a broad, diversified core built to stay close to its target allocation with regular rebalancing.",
    draft: {
      name: 'Rebalancer',
      description: 'A broad diversified core, rebalanced monthly to stay at target allocation',
      rows: [
        { ticker: 'VTI', weight: 30 },
        { ticker: 'QQQ', weight: 25 },
        { ticker: 'JNJ', weight: 25 },
        { ticker: 'JPM', weight: 20 },
      ],
      rules: {
        rebalance: { enabled: true, every: 30, unit: 'Days' },
        stopLoss: { enabled: false, percent: 30 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
  {
    id: 'tax-harvester',
    matches: ['tax', 'harvest', 'loss', 'offset gains'],
    assistantReply: "I'll pair some steady winners with names that have more room to dip, so there's always something to harvest against gains — rebalanced quarterly.",
    draft: {
      name: 'Tax Harvester',
      description: 'Pairs steady winners with laggards to harvest losses against gains',
      rows: [
        { ticker: 'AAPL', weight: 30 },
        { ticker: 'MSFT', weight: 30 },
        { ticker: 'PFE', weight: 20 },
        { ticker: 'INTC', weight: 20 },
      ],
      rules: {
        rebalance: { enabled: true, every: 90, unit: 'Days' },
        stopLoss: { enabled: false, percent: 30 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
  {
    id: 'hedge-agent',
    matches: ['hedge', 'protect', 'volatility', 'downside', 'crash'],
    assistantReply: "I'll lean defensive here — steadier names with a tighter stop-loss, so volatility spikes do less damage.",
    draft: {
      name: 'Hedge Agent',
      description: 'A defensive tilt with a tight stop-loss to limit damage from volatility spikes',
      rows: [
        { ticker: 'VOO', weight: 30 },
        { ticker: 'JNJ', weight: 25 },
        { ticker: 'KO', weight: 25 },
        { ticker: 'PEP', weight: 20 },
      ],
      rules: {
        rebalance: { enabled: true, every: 30, unit: 'Days' },
        stopLoss: { enabled: true, percent: 15 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
  {
    id: 'dividend-reinvestor',
    matches: ['dividend', 'reinvest', 'income', 'payout'],
    assistantReply: "I'll focus on higher-yield names and rebalance quarterly, roughly matching typical payout cadence.",
    draft: {
      name: 'Dividend Reinvestor',
      description: 'High-yield names, rebalanced quarterly to match typical payout cadence',
      rows: [
        { ticker: 'KO', weight: 30 },
        { ticker: 'PEP', weight: 25 },
        { ticker: 'JNJ', weight: 25 },
        { ticker: 'VZ', weight: 20 },
      ],
      rules: {
        rebalance: { enabled: true, every: 90, unit: 'Days' },
        stopLoss: { enabled: false, percent: 30 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
  {
    id: 'generic',
    matches: [],
    assistantReply: "Here's a diversified quality strategy generated from what you described, including its target allocation and risk rules.",
    draft: {
      name: 'Quality Compounders',
      description: 'Durable businesses with resilient cash flows, balanced by broad-market exposure and disciplined monthly rebalancing',
      rows: [
        { ticker: 'VTI', weight: 30 },
        { ticker: 'QQQ', weight: 25 },
        { ticker: 'AAPL', weight: 25 },
        { ticker: 'JNJ', weight: 20 },
      ],
      rules: {
        rebalance: { enabled: true, every: 30, unit: 'Days' },
        stopLoss: { enabled: false, percent: 30 },
        takeProfit: { enabled: false, percent: 50 },
      },
    },
  },
];
