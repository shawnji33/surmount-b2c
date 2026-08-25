// Shared strategy data for the onboarding "Build your portfolio" step.
// Names + covers come from the project strategy library (public/assets/strategy-covers).

export type Term = 'Short term' | 'Mid term' | 'Long term';
export type Objective = 'Growth' | 'Income' | 'Balanced' | 'N/A';
export type Category = 'Equity' | 'Crypto' | 'ETF';

export type Weighted = { name: string; pct: number };

export type Strategy = {
  id: string;
  name: string;
  cover: string;
  category: Category;
  term: Term;
  objective: Objective;
  riskScore: number; // 1 (low) – 5 (high)
  suggested: number; // relative suggested weight
  industries: Weighted[];
  assets: Weighted[];
};

const cover = (file: string) => `/assets/strategy-covers/${encodeURIComponent(file)}.png`;

export const STRATEGIES: Strategy[] = [
  {
    id: 'aapl-goog-arb', name: 'AAPL GOOG Arb', cover: cover('AAPL GOOG Arb'),
    category: 'Equity', term: 'Short term', objective: 'Growth', riskScore: 2.26, suggested: 8,
    industries: [{ name: 'Technology', pct: 70 }, { name: 'Communication', pct: 30 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'ko-pep-arb', name: 'KO-PEP Arbitrage', cover: cover('KO-PEP Arbitrage'),
    category: 'Equity', term: 'Short term', objective: 'Balanced', riskScore: 3.04, suggested: 7,
    industries: [{ name: 'Consumer Defensive', pct: 100 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'rsi-weighted-etfs', name: 'RSI-Weighted ETFs', cover: cover('RSI-Weighted ETFs'),
    category: 'ETF', term: 'Mid term', objective: 'Growth', riskScore: 2.33, suggested: 10,
    industries: [{ name: 'Diversified', pct: 60 }, { name: 'Technology', pct: 25 }, { name: 'Financial Services', pct: 15 }],
    assets: [{ name: 'ETF', pct: 100 }],
  },
  {
    id: 'faang-insider', name: 'FAANG Insider Trading', cover: cover('FAANG Insider Trading'),
    category: 'Equity', term: 'Short term', objective: 'Growth', riskScore: 2.52, suggested: 9,
    industries: [{ name: 'Technology', pct: 55 }, { name: 'Communication', pct: 30 }, { name: 'Consumer Cyclical', pct: 15 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'trowe-opps', name: 'T-Rowe Opportunities Fund Tracker', cover: cover('T-Rowe Opportunities Fund Tracker'),
    category: 'Equity', term: 'Long term', objective: 'Growth', riskScore: 2.17, suggested: 11,
    industries: [{ name: 'Technology', pct: 35 }, { name: 'Healthcare', pct: 25 }, { name: 'Financial Services', pct: 25 }, { name: 'Industrials', pct: 15 }],
    assets: [{ name: 'US Equity', pct: 85 }, { name: 'Intl Equity', pct: 15 }],
  },
  {
    id: 'trowe-dividend', name: 'T Rowe Dividend Growth Tracker', cover: cover('T Rowe Dividend Growth Tracker'),
    category: 'Equity', term: 'Long term', objective: 'Income', riskScore: 2.53, suggested: 8,
    industries: [{ name: 'Financial Services', pct: 30 }, { name: 'Healthcare', pct: 25 }, { name: 'Consumer Defensive', pct: 25 }, { name: 'Industrials', pct: 20 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'tesla-ema', name: 'Tesla Short and Long EMA', cover: cover('Tesla Short and Long EMA'),
    category: 'Equity', term: 'Long term', objective: 'Growth', riskScore: 3.4, suggested: 5,
    industries: [{ name: 'Consumer Cyclical', pct: 100 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'ai-iot', name: 'AI & IOT', cover: cover('AI & IOT'),
    category: 'Equity', term: 'Short term', objective: 'Growth', riskScore: 2.7, suggested: 9,
    industries: [{ name: 'Technology', pct: 75 }, { name: 'Industrials', pct: 25 }],
    assets: [{ name: 'US Equity', pct: 90 }, { name: 'Intl Equity', pct: 10 }],
  },
  {
    id: 'carbon-capture', name: 'Carbon Capture & Storage Champions', cover: cover('Carbon Capture & Storage Champions'),
    category: 'Equity', term: 'Mid term', objective: 'Growth', riskScore: 2.9, suggested: 6,
    industries: [{ name: 'Energy', pct: 50 }, { name: 'Industrials', pct: 30 }, { name: 'Utilities', pct: 20 }],
    assets: [{ name: 'US Equity', pct: 70 }, { name: 'Intl Equity', pct: 30 }],
  },
  {
    id: 'green-investing', name: 'Green Investing', cover: cover('Green Investing'),
    category: 'Equity', term: 'Mid term', objective: 'Growth', riskScore: 3.8, suggested: 4,
    industries: [{ name: 'Energy', pct: 45 }, { name: 'Utilities', pct: 30 }, { name: 'Industrials', pct: 25 }],
    assets: [{ name: 'US Equity', pct: 60 }, { name: 'Intl Equity', pct: 40 }],
  },
  {
    id: 'robotics', name: 'Robotics & Automation Advancements', cover: cover('Robotics & Automation Advancements'),
    category: 'Equity', term: 'Mid term', objective: 'Growth', riskScore: 2.8, suggested: 7,
    industries: [{ name: 'Industrials', pct: 50 }, { name: 'Technology', pct: 50 }],
    assets: [{ name: 'US Equity', pct: 80 }, { name: 'Intl Equity', pct: 20 }],
  },
  {
    id: 'virt-spy', name: '$VIRT SPY Volume Correlation', cover: cover('$VIRT SPY Volume Correlation'),
    category: 'Equity', term: 'Mid term', objective: 'Balanced', riskScore: 2.6, suggested: 6,
    industries: [{ name: 'Financial Services', pct: 100 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'nextgen-data', name: 'Next-Gen Data Infrastructure', cover: cover('Next-Gen Data Infrastructure'),
    category: 'Equity', term: 'Mid term', objective: 'Growth', riskScore: 2.5, suggested: 8,
    industries: [{ name: 'Technology', pct: 65 }, { name: 'Communication', pct: 20 }, { name: 'Utilities', pct: 15 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'quantum', name: 'Quantum Computing Leaders', cover: cover('Quantum Computing Leaders'),
    category: 'Equity', term: 'Long term', objective: 'Growth', riskScore: 2.1, suggested: 12,
    industries: [{ name: 'Technology', pct: 60 }, { name: 'Industrials', pct: 25 }, { name: 'Utilities', pct: 15 }],
    assets: [{ name: 'US Equity', pct: 85 }, { name: 'Intl Equity', pct: 15 }],
  },
  {
    id: 'ai-innovators', name: 'AI Innovators', cover: cover('AI Innovators'),
    category: 'Equity', term: 'Long term', objective: 'Growth', riskScore: 2.4, suggested: 10,
    industries: [{ name: 'Technology', pct: 80 }, { name: 'Communication', pct: 20 }],
    assets: [{ name: 'US Equity', pct: 100 }],
  },
  {
    id: 'nanotech', name: 'Nanotechnology Innovators', cover: cover('Nanotechnology Innovators'),
    category: 'Equity', term: 'Long term', objective: 'Growth', riskScore: 2.2, suggested: 6,
    industries: [{ name: 'Healthcare', pct: 40 }, { name: 'Industrials', pct: 35 }, { name: 'Technology', pct: 25 }],
    assets: [{ name: 'US Equity', pct: 75 }, { name: 'Intl Equity', pct: 25 }],
  },
];

// Consistent category colors for overview breakdown bars (brand-anchored ramp).
export const SEGMENT_COLORS = [
  'var(--color-brand-600, #406ad0)',
  'var(--color-brand-400, #7a9ce0)',
  'var(--color-brand-300, #a6c0ec)',
  'var(--color-brand-700, #3757be)',
  'var(--color-brand-200, #c8d8f3)',
  'var(--color-brand-800, #2c4699)',
  'var(--color-brand-500, #5a82d8)',
  'var(--color-brand-100, #e1e9f9)',
];

// Deterministic per-strategy detail (price, return, chart) so the drawer is stable across renders.
const AUTHORS = ['Logan Weaver', 'Maya Chen', 'Daniel Brooks', 'Sofia Rivera', 'Noah Patel', 'Ava Thompson'];

function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type StrategyDetail = {
  author: string;
  oneYearReturn: string;
  oneYearPositive: boolean;
  price: string;
  change: string;
  changePct: string;
  changePositive: boolean;
  holdingsCount: number;
  topIndustry: string;
  sparkline: number[];
};

export function getStrategyDetail(s: Strategy): StrategyDetail {
  const rnd = seeded(s.id);
  const ret = 4 + rnd() * 14; // 4–18%
  const price = 42 + rnd() * 210;
  const chgPct = rnd() * 3 - 0.6; // -0.6 .. +2.4
  const chg = (price * chgPct) / 100;

  // upward-drifting sparkline
  const pts: number[] = [];
  let v = 100;
  for (let i = 0; i < 48; i++) {
    v += (rnd() - 0.42) * 6;
    pts.push(Math.max(40, v));
  }

  return {
    author: AUTHORS[Math.floor(rnd() * AUTHORS.length)],
    oneYearReturn: `${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%`,
    oneYearPositive: ret >= 0,
    price: `$${price.toFixed(2)}`,
    change: `${chg >= 0 ? '+' : '-'}$${Math.abs(chg).toFixed(2)}`,
    changePct: `${chgPct >= 0 ? '+' : ''}${chgPct.toFixed(2)}%`,
    changePositive: chgPct >= 0,
    holdingsCount: 12 + Math.floor(rnd() * 30),
    topIndustry: s.industries[0]?.name ?? '—',
    sparkline: pts,
  };
}

export type RiskTone = 'low' | 'medium' | 'high';
export function riskTone(score: number): RiskTone {
  if (score < 2.4) return 'low';
  if (score < 3.0) return 'medium';
  return 'high';
}
export function riskLabel(score: number): string {
  const t = riskTone(score);
  return t === 'low' ? 'Low' : t === 'medium' ? 'Medium' : 'High';
}
