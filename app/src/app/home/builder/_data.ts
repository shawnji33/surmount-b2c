import type { Asset, AssetClass, AllocationRow, MarketCapBucket, RuleState } from './_shared/types';

export type BuilderSlug = 'etf' | 'no-code' | 'code' | 'promptfolio';

export type BuilderType = {
  slug: BuilderSlug;
  name: string;
  badgeLabel: string;
  badgeTone: 'beginner' | 'intermediate' | 'advanced' | 'ai';
  shortDesc: string;
  longDesc: string;
  comingSoonBullets: string[];
};

export const BUILDER_TYPES: Record<BuilderSlug, BuilderType> = {
  etf: {
    slug: 'etf',
    name: 'ETF Builder',
    badgeLabel: 'Beginner',
    badgeTone: 'beginner',
    shortDesc: 'Select and weight ETFs visually. No programming required.',
    longDesc: 'Our simplest and most intuitive builder for creating basic strategies & portfolios with just a few clicks.',
    comingSoonBullets: [
      'Search and add ETFs from a visual picker',
      'Set target weights with drag-to-adjust sliders',
      'Preview projected performance before you launch',
    ],
  },
  'no-code': {
    slug: 'no-code',
    name: 'No-Code Builder',
    badgeLabel: 'Intermediate',
    badgeTone: 'intermediate',
    shortDesc: 'Build rule-based strategies without writing a single line of code.',
    longDesc: 'Build rule-based strategies without writing a single line of code.',
    comingSoonBullets: [
      'Chain entry, exit, and rebalance rules visually',
      'Combine technical and fundamental conditions',
      'Backtest rules against historical data',
    ],
  },
  code: {
    slug: 'code',
    name: 'Code Builder',
    badgeLabel: 'Advanced',
    badgeTone: 'advanced',
    shortDesc: 'Write strategy logic directly in Python with our SDK.',
    longDesc: 'Write strategy logic directly in Python with our SDK.',
    comingSoonBullets: [
      'Full Python SDK with market data and order primitives',
      'Run and debug strategies in a hosted notebook',
      'Deploy straight from your code to a live strategy',
    ],
  },
  promptfolio: {
    slug: 'promptfolio',
    name: 'Promptfolio',
    badgeLabel: 'Surmount AI',
    badgeTone: 'ai',
    shortDesc: 'Turn plain English ideas into automated strategies with AI.',
    longDesc: 'Turn plain English ideas into automated investment strategies with AI.',
    comingSoonBullets: [
      'Describe a strategy idea in plain English',
      'Surmount AI drafts holdings, weights, and rules',
      'Refine and launch with a conversational back-and-forth',
    ],
  },
};

export const BUILDER_ORDER: BuilderSlug[] = ['etf', 'no-code', 'code', 'promptfolio'];

export type StrategyCardData = {
  id: string;
  name: string;
  desc: string;
  aumValue: string;
  returnAbs: string;
  returnPct: string;
  brokers: string[];
  nextRebalanceDays: number;
};

const B = (name: string) => `/assets/brokers/${name}.png`;

export const MY_STRATEGIES: StrategyCardData[] = [
  { id: 'dividend-growth', name: 'Dividend Growth', desc: 'High-yield dividend strategy with growth focus', aumValue: '$8,140.00', returnAbs: '$340.82', returnPct: '+4.37%', brokers: [B('ibkr')], nextRebalanceDays: 7 },
  { id: 'tech-momentum', name: 'Tech Momentum', desc: 'Momentum-based rotation across tech sectors', aumValue: '$5,500.00', returnAbs: '$214.60', returnPct: '+4.07%', brokers: [B('ibkr'), B('schwab')], nextRebalanceDays: 12 },
  { id: 'global-macro', name: 'Global Macro', desc: 'Multi-asset macro strategy across global markets', aumValue: '$12,300.00', returnAbs: '$615.00', returnPct: '+5.24%', brokers: [B('webull')], nextRebalanceDays: 30 },
  { id: 'low-volatility', name: 'Low Volatility', desc: 'Defensive equity strategy targeting min volatility', aumValue: '$3,950.00', returnAbs: '$88.12', returnPct: '+2.28%', brokers: [B('ibkr'), B('schwab')], nextRebalanceDays: 18 },
  { id: 'value-rotation', name: 'Value Rotation', desc: 'Rotates into undervalued sectors on a quarterly basis', aumValue: '$6,720.00', returnAbs: '$156.30', returnPct: '+2.38%', brokers: [B('schwab'), B('webull')], nextRebalanceDays: 21 },
  { id: 'small-cap-growth', name: 'Small Cap Growth', desc: 'High-growth small cap equities with quarterly rebalance', aumValue: '$4,280.00', returnAbs: '$302.11', returnPct: '+7.60%', brokers: [B('ibkr'), B('schwab'), B('webull')], nextRebalanceDays: 9 },
  { id: 'emerging-markets-core', name: 'Emerging Markets Core', desc: 'Broad emerging market exposure across regions', aumValue: '$9,845.00', returnAbs: '$198.44', returnPct: '+2.06%', brokers: [B('ibkr')], nextRebalanceDays: 26 },
  { id: 'options-income', name: 'Options Income', desc: 'Covered call strategy for steady monthly income', aumValue: '$2,410.00', returnAbs: '$54.22', returnPct: '+2.30%', brokers: [B('schwab')], nextRebalanceDays: 4 },
  { id: 'esg-leaders', name: 'ESG Leaders', desc: 'Sustainability-screened large cap equity portfolio', aumValue: '$7,105.00', returnAbs: '$168.90', returnPct: '+2.44%', brokers: [B('ibkr'), B('webull')], nextRebalanceDays: 15 },
];

/* Draft strategies — built but never deployed, so there's no invested-account or return data to
 * show. The Drafts tab shows the strategy's shape instead (allocation, rules) so the card is still
 * a meaningful preview of what you were building. */
export type DraftStrategyCardData = {
  id: string;
  name: string;
  desc: string;
  rows: AllocationRow[];
  rules: RuleState;
};

export const DRAFT_STRATEGIES: DraftStrategyCardData[] = [
  {
    id: 'draft-ai-infrastructure',
    name: 'AI Infrastructure',
    desc: 'Semiconductor and cloud compute exposure for the AI buildout',
    rows: [
      { ticker: 'NVDA', weight: 35 },
      { ticker: 'MSFT', weight: 25 },
      { ticker: 'AMD', weight: 20 },
      { ticker: 'GOOGL', weight: 20 },
    ],
    rules: {
      rebalance: { enabled: true, every: 30, unit: 'Days' },
      stopLoss: { enabled: true, percent: 25 },
      takeProfit: { enabled: false, percent: 50 },
    },
  },
  {
    id: 'draft-defensive-staples',
    name: 'Defensive Staples',
    desc: 'Low-volatility consumer staples for capital preservation',
    rows: [
      { ticker: 'KO', weight: 30 },
      { ticker: 'PEP', weight: 30 },
      { ticker: 'WMT', weight: 25 },
      { ticker: 'MCD', weight: 15 },
    ],
    rules: {
      rebalance: { enabled: true, every: 90, unit: 'Days' },
      stopLoss: { enabled: false, percent: 30 },
      takeProfit: { enabled: false, percent: 50 },
    },
  },
  {
    id: 'draft-ev-supply-chain',
    name: 'EV Supply Chain',
    desc: 'Electric vehicle makers and battery supply chain',
    rows: [
      { ticker: 'TSLA', weight: 40 },
      { ticker: 'F', weight: 20 },
      { ticker: 'GM', weight: 20 },
      { ticker: 'AAPL', weight: 20 },
    ],
    rules: {
      rebalance: { enabled: false, every: 30, unit: 'Days' },
      stopLoss: { enabled: true, percent: 20 },
      takeProfit: { enabled: true, percent: 40 },
    },
  },
];

/* Fields every asset carries regardless of enrichment — the hand-typed source list below. */
type RawAsset = Omit<Asset, 'assetClass' | 'marketCap' | 'dividendYieldPct' | 'peRatio' | 'expenseRatioPct' | 'aumBillions' | 'category'>;

/* Unified asset universe shared by both builders' asset picker and, for the No-Code Builder,
 * the Logic builder's condition-editor asset pickers — the source mockups used two disconnected
 * ticker lists for these; this app uses one. Spans a wide spread of industries so category
 * filters (Pick Stocks, Add assets) have real variety and the lists actually scroll. `logo` is
 * only set for tickers with an asset in public/assets/logos/ — everything else falls back to a
 * colored initial circle. */
const RAW_ASSETS: RawAsset[] = [
  { ticker: 'NFLX', name: 'Netflix', industry: 'Entertainment', price: '$642.80', returnPct: '+28.4%', positive: true, fallbackColor: '#E50914' },
  { ticker: 'AAPL', name: 'Apple', industry: 'Consumer Electronics', price: '$189.30', returnPct: '+15.2%', positive: true, logo: '/assets/logos/AAPL.webp', fallbackColor: '#555555' },
  { ticker: 'AMZN', name: 'Amazon', industry: 'E-Commerce', price: '$178.25', returnPct: '+22.8%', positive: true, logo: '/assets/logos/AMZN.webp', fallbackColor: '#FF9900' },
  { ticker: 'GOOGL', name: 'Alphabet', industry: 'Internet Services', price: '$141.80', returnPct: '+18.1%', positive: true, logo: '/assets/logos/GOOG.webp', fallbackColor: '#4285F4' },
  { ticker: 'MSFT', name: 'Microsoft', industry: 'Cloud Software', price: '$374.50', returnPct: '+12.9%', positive: true, logo: '/assets/logos/MSFT.webp', fallbackColor: '#00A4EF' },
  { ticker: 'TSLA', name: 'Tesla', industry: 'Electric Vehicles', price: '$248.50', returnPct: '-6.3%', positive: false, logo: '/assets/logos/TSLA.webp', fallbackColor: '#CC0000' },
  { ticker: 'META', name: 'Meta Platforms', industry: 'Social Media', price: '$502.30', returnPct: '+31.7%', positive: true, logo: '/assets/logos/META.webp', fallbackColor: '#0668E1' },
  { ticker: 'NVDA', name: 'NVIDIA', industry: 'Semiconductors', price: '$875.40', returnPct: '+44.2%', positive: true, logo: '/assets/logos/NVDA.webp', fallbackColor: '#76B900' },
  { ticker: 'DIS', name: 'Disney', industry: 'Entertainment', price: '$111.20', returnPct: '-4.8%', positive: false, fallbackColor: '#113CCF' },
  { ticker: 'PYPL', name: 'PayPal', industry: 'Fintech', price: '$62.40', returnPct: '-11.2%', positive: false, fallbackColor: '#003087' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', industry: 'Index ETF', price: '$492.30', returnPct: '+12.4%', positive: true, fallbackColor: '#535861' },
  { ticker: 'QQQ', name: 'Invesco NASDAQ 100', industry: 'Index ETF', price: '$428.70', returnPct: '+18.6%', positive: true, fallbackColor: '#414651' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', industry: 'Semiconductors', price: '$172.40', returnPct: '+9.8%', positive: true, logo: '/assets/logos/AMD.webp', fallbackColor: '#000000' },
  { ticker: 'INTC', name: 'Intel', industry: 'Semiconductors', price: '$31.20', returnPct: '-18.4%', positive: false, fallbackColor: '#0071C5' },
  { ticker: 'TXN', name: 'Texas Instruments', industry: 'Semiconductors', price: '$198.30', returnPct: '+2.9%', positive: true, fallbackColor: '#7C0A02' },
  { ticker: 'V', name: 'Visa', industry: 'Payments', price: '$289.60', returnPct: '+6.1%', positive: true, logo: '/assets/logos/V.webp', fallbackColor: '#1A1F71' },
  { ticker: 'MA', name: 'Mastercard', industry: 'Payments', price: '$512.80', returnPct: '+7.4%', positive: true, logo: '/assets/logos/MA.webp', fallbackColor: '#EB001B' },
  { ticker: 'SQ', name: 'Block', industry: 'Payments', price: '$68.90', returnPct: '-7.8%', positive: false, fallbackColor: '#00D64B' },
  { ticker: 'COIN', name: 'Coinbase', industry: 'Fintech', price: '$198.40', returnPct: '+22.6%', positive: true, fallbackColor: '#0052FF' },
  { ticker: 'HOOD', name: 'Robinhood Markets', industry: 'Fintech', price: '$46.80', returnPct: '+34.7%', positive: true, fallbackColor: '#00C805' },
  { ticker: 'JPM', name: 'JPMorgan Chase', industry: 'Financial Services', price: '$221.30', returnPct: '+5.6%', positive: true, fallbackColor: '#003D6B' },
  { ticker: 'BAC', name: 'Bank of America', industry: 'Financial Services', price: '$41.75', returnPct: '-1.9%', positive: false, fallbackColor: '#012169' },
  { ticker: 'WMT', name: 'Walmart', industry: 'Retail', price: '$96.20', returnPct: '+3.2%', positive: true, fallbackColor: '#0071CE' },
  { ticker: 'TGT', name: 'Target', industry: 'Retail', price: '$148.90', returnPct: '-2.4%', positive: false, fallbackColor: '#CC0000' },
  { ticker: 'COST', name: 'Costco', industry: 'Retail', price: '$912.40', returnPct: '+14.6%', positive: true, fallbackColor: '#E31837' },
  { ticker: 'SHOP', name: 'Shopify', industry: 'E-Commerce', price: '$78.60', returnPct: '+14.1%', positive: true, fallbackColor: '#95BF47' },
  { ticker: 'KO', name: 'Coca-Cola', industry: 'Food & Beverage', price: '$63.50', returnPct: '+1.8%', positive: true, fallbackColor: '#F40009' },
  { ticker: 'PEP', name: 'PepsiCo', industry: 'Food & Beverage', price: '$172.10', returnPct: '+2.5%', positive: true, fallbackColor: '#004B93' },
  { ticker: 'MCD', name: "McDonald's", industry: 'Restaurants', price: '$294.30', returnPct: '+4.1%', positive: true, fallbackColor: '#DA291C' },
  { ticker: 'SBUX', name: 'Starbucks', industry: 'Restaurants', price: '$91.60', returnPct: '-3.7%', positive: false, fallbackColor: '#00704A' },
  { ticker: 'NKE', name: 'Nike', industry: 'Apparel', price: '$78.40', returnPct: '-5.2%', positive: false, fallbackColor: '#111111' },
  { ticker: 'LULU', name: 'Lululemon', industry: 'Apparel', price: '$312.70', returnPct: '+8.9%', positive: true, fallbackColor: '#A6192E' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', industry: 'Healthcare', price: '$158.20', returnPct: '+2.1%', positive: true, fallbackColor: '#CF0A2C' },
  { ticker: 'UNH', name: 'UnitedHealth', industry: 'Healthcare', price: '$541.60', returnPct: '+6.7%', positive: true, fallbackColor: '#002677' },
  { ticker: 'PFE', name: 'Pfizer', industry: 'Pharmaceuticals', price: '$27.80', returnPct: '-8.3%', positive: false, fallbackColor: '#0093D0' },
  { ticker: 'MRNA', name: 'Moderna', industry: 'Biotech', price: '$38.90', returnPct: '-14.2%', positive: false, fallbackColor: '#C8102E' },
  { ticker: 'XOM', name: 'Exxon Mobil', industry: 'Energy', price: '$118.40', returnPct: '+3.9%', positive: true, fallbackColor: '#ED1C24' },
  { ticker: 'CVX', name: 'Chevron', industry: 'Energy', price: '$161.70', returnPct: '+2.6%', positive: true, fallbackColor: '#005DAA' },
  { ticker: 'BA', name: 'Boeing', industry: 'Aerospace & Defense', price: '$178.90', returnPct: '-9.6%', positive: false, fallbackColor: '#0033A0' },
  { ticker: 'LMT', name: 'Lockheed Martin', industry: 'Aerospace & Defense', price: '$468.20', returnPct: '+5.3%', positive: true, fallbackColor: '#002F6C' },
  { ticker: 'DAL', name: 'Delta Air Lines', industry: 'Airlines', price: '$52.60', returnPct: '+7.2%', positive: true, fallbackColor: '#E01933' },
  { ticker: 'UAL', name: 'United Airlines', industry: 'Airlines', price: '$58.90', returnPct: '-4.5%', positive: false, fallbackColor: '#002244' },
  { ticker: 'T', name: 'AT&T', industry: 'Telecom', price: '$19.40', returnPct: '-2.8%', positive: false, fallbackColor: '#00A8E0' },
  { ticker: 'VZ', name: 'Verizon', industry: 'Telecom', price: '$41.20', returnPct: '+1.4%', positive: true, fallbackColor: '#EE0000' },
  { ticker: 'F', name: 'Ford', industry: 'Automotive', price: '$12.30', returnPct: '-3.1%', positive: false, fallbackColor: '#00095B' },
  { ticker: 'GM', name: 'General Motors', industry: 'Automotive', price: '$46.80', returnPct: '+4.4%', positive: true, fallbackColor: '#1D5BBF' },
  { ticker: 'RBLX', name: 'Roblox', industry: 'Gaming', price: '$46.10', returnPct: '+11.3%', positive: true, fallbackColor: '#E2231A' },
  { ticker: 'EA', name: 'Electronic Arts', industry: 'Gaming', price: '$142.50', returnPct: '+3.6%', positive: true, fallbackColor: '#E5202E' },
  { ticker: 'ORCL', name: 'Oracle', industry: 'Cloud Software', price: '$172.90', returnPct: '+9.1%', positive: true, fallbackColor: '#C74634' },
  { ticker: 'CRM', name: 'Salesforce', industry: 'Cloud Software', price: '$298.40', returnPct: '+6.8%', positive: true, fallbackColor: '#00A1E0' },
  { ticker: 'IBM', name: 'IBM', industry: 'Cloud Software', price: '$198.70', returnPct: '+4.6%', positive: true, fallbackColor: '#054ADA' },
  { ticker: 'ADBE', name: 'Adobe', industry: 'Creative Software', price: '$521.60', returnPct: '+5.9%', positive: true, fallbackColor: '#FA0F00' },
  { ticker: 'PLTR', name: 'Palantir', industry: 'Data & Analytics', price: '$28.90', returnPct: '+31.4%', positive: true, fallbackColor: '#1D1D26' },
  { ticker: 'UBER', name: 'Uber', industry: 'Mobility', price: '$76.40', returnPct: '+12.8%', positive: true, fallbackColor: '#000000' },
  { ticker: 'ABNB', name: 'Airbnb', industry: 'Travel', price: '$134.70', returnPct: '-6.2%', positive: false, fallbackColor: '#FF385C' },
  { ticker: 'SPOT', name: 'Spotify', industry: 'Entertainment', price: '$412.30', returnPct: '+18.9%', positive: true, fallbackColor: '#1DB954' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', industry: 'Index ETF', price: '$268.40', returnPct: '+11.2%', positive: true, fallbackColor: '#2E2E2E' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', industry: 'Index ETF', price: '$478.90', returnPct: '+12.6%', positive: true, fallbackColor: '#96151D' },
];

const ETF_TICKERS = new Set(['SPY', 'QQQ', 'VTI', 'VOO']);

/* Hand-curated for the names anyone reviewing this would recognize — realistic enough that a
 * "dividend yield > 3%" or "P/E < 15" filter produces a believable, non-random split. Everything
 * not listed here falls back to a deterministic per-ticker derivation below, so the full universe
 * is populated for filtering without hand-typing every row. */
const OVERRIDES: Record<string, Partial<Pick<Asset, 'marketCap' | 'dividendYieldPct' | 'peRatio' | 'expenseRatioPct' | 'aumBillions' | 'category'>>> = {
  AAPL: { marketCap: 'large', dividendYieldPct: 0.5, peRatio: 31 },
  MSFT: { marketCap: 'large', dividendYieldPct: 0.8, peRatio: 35 },
  NVDA: { marketCap: 'large', dividendYieldPct: 0.03, peRatio: 64 },
  AMZN: { marketCap: 'large', dividendYieldPct: 0, peRatio: 42 },
  GOOGL: { marketCap: 'large', dividendYieldPct: 0.4, peRatio: 24 },
  META: { marketCap: 'large', dividendYieldPct: 0.4, peRatio: 27 },
  TSLA: { marketCap: 'large', dividendYieldPct: 0, peRatio: 68 },
  JPM: { marketCap: 'large', dividendYieldPct: 2.3, peRatio: 12 },
  BAC: { marketCap: 'large', dividendYieldPct: 2.6, peRatio: 11 },
  KO: { marketCap: 'large', dividendYieldPct: 3.0, peRatio: 24 },
  PEP: { marketCap: 'large', dividendYieldPct: 3.1, peRatio: 21 },
  XOM: { marketCap: 'large', dividendYieldPct: 3.3, peRatio: 14 },
  CVX: { marketCap: 'large', dividendYieldPct: 3.5, peRatio: 13 },
  VZ: { marketCap: 'large', dividendYieldPct: 6.4, peRatio: 9 },
  T: { marketCap: 'large', dividendYieldPct: 5.9, peRatio: 10 },
  PFE: { marketCap: 'large', dividendYieldPct: 5.8, peRatio: 13 },
  MCD: { marketCap: 'large', dividendYieldPct: 2.3, peRatio: 25 },
  WMT: { marketCap: 'large', dividendYieldPct: 1.2, peRatio: 33 },
  JNJ: { marketCap: 'large', dividendYieldPct: 3.0, peRatio: 16 },
  COIN: { marketCap: 'mid', dividendYieldPct: 0, peRatio: null },
  HOOD: { marketCap: 'mid', dividendYieldPct: 0, peRatio: 42 },
  RBLX: { marketCap: 'mid', dividendYieldPct: 0, peRatio: null },
  PLTR: { marketCap: 'mid', dividendYieldPct: 0, peRatio: null },
  MRNA: { marketCap: 'mid', dividendYieldPct: 0, peRatio: null },
  SHOP: { marketCap: 'mid', dividendYieldPct: 0, peRatio: null },
  ABNB: { marketCap: 'mid', dividendYieldPct: 0, peRatio: 19 },
  F: { marketCap: 'mid', dividendYieldPct: 5.2, peRatio: 8 },
  INTC: { marketCap: 'mid', dividendYieldPct: 1.8, peRatio: null },

  SPY: { expenseRatioPct: 0.09, aumBillions: 548, category: 'Large-cap index' },
  VOO: { expenseRatioPct: 0.03, aumBillions: 462, category: 'Large-cap index' },
  QQQ: { expenseRatioPct: 0.2, aumBillions: 312, category: 'Growth index' },
  VTI: { expenseRatioPct: 0.03, aumBillions: 401, category: 'Total-market index' },
};

/* Stable string hash → deterministic fallback values for every ticker not hand-curated above. */
function seededFraction(ticker: string): number {
  let hash = 0;
  for (let i = 0; i < ticker.length; i += 1) hash = (hash * 31 + ticker.charCodeAt(i)) >>> 0;
  return (hash % 1000) / 1000;
}

function deriveMarketCap(ticker: string): MarketCapBucket {
  const f = seededFraction(ticker);
  if (f < 0.45) return 'large';
  if (f < 0.8) return 'mid';
  return 'small';
}

function deriveDividendYield(ticker: string): number {
  const f = seededFraction(`${ticker}-div`);
  if (f < 0.35) return 0;
  return Math.round(f * 4 * 10) / 10;
}

function derivePE(ticker: string): number | null {
  const f = seededFraction(`${ticker}-pe`);
  if (f < 0.1) return null;
  return Math.round(8 + f * 45);
}

export const ASSET_UNIVERSE: Asset[] = RAW_ASSETS.map((asset): Asset => {
  const isEtf = ETF_TICKERS.has(asset.ticker);
  const override = OVERRIDES[asset.ticker] ?? {};
  const assetClass: AssetClass = isEtf ? 'etf' : 'stock';
  return {
    ...asset,
    assetClass,
    marketCap: isEtf ? null : (override.marketCap ?? deriveMarketCap(asset.ticker)),
    dividendYieldPct: override.dividendYieldPct ?? (isEtf ? 1.3 : deriveDividendYield(asset.ticker)),
    peRatio: isEtf ? null : (override.peRatio !== undefined ? override.peRatio : derivePE(asset.ticker)),
    expenseRatioPct: isEtf ? (override.expenseRatioPct ?? 0.15) : null,
    aumBillions: isEtf ? (override.aumBillions ?? 5) : null,
    category: isEtf ? (override.category ?? 'Index') : null,
  };
});
