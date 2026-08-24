export type AssetClass = 'stock' | 'etf';
export type MarketCapBucket = 'large' | 'mid' | 'small';

export type Asset = {
  ticker: string;
  name: string;
  industry: string;
  price: string;
  returnPct: string;
  positive: boolean;
  logo?: string;
  fallbackColor: string;
  assetClass: AssetClass;
  /** Stocks only — ETFs don't have a single-issuer market cap. */
  marketCap: MarketCapBucket | null;
  dividendYieldPct: number;
  /** Stocks only. */
  peRatio: number | null;
  /** ETFs only. */
  expenseRatioPct: number | null;
  /** ETFs only. */
  aumBillions: number | null;
  /** ETFs only — e.g. "Large-cap index", "Growth index". */
  category: string | null;
};

export type AssetFilterState = {
  query: string;
  /** Multi-select — empty array means no industry filter applied. */
  industries: string[];
  assetClass: AssetClass | 'all';
  maxPrice: number | null;
  marketCap: MarketCapBucket | 'all';
  minDividendYieldPct: number;
  maxPE: number | null;
  maxExpenseRatioPct: number | null;
  minAumBillions: number | null;
};

export type AllocationMethod = 'equal' | 'custom';

export type AllocationRow = {
  ticker: string;
  weight: number;
};

export type RuleState = {
  rebalance: { enabled: boolean; every: number; unit: 'Days' | 'Weeks' | 'Months' };
  stopLoss: { enabled: boolean; percent: number };
  takeProfit: { enabled: boolean; percent: number };
};

export type BacktestConfig = {
  startDate: Date | null;
  endDate: Date | null;
  simulatedAmount: string;
  slippageBps: string;
};

export type BacktestPoint = {
  time: string;
  value: number;
  drawdownPct: number;
};

export type BacktestRangeTab = '1Y' | '5Y' | '10Y';

export type BacktestStatus = 'idle' | 'loading' | 'done';

export type BreakdownHolding = {
  ticker: string;
  name: string;
  weightPct: number;
  logo?: string;
  fallbackColor: string;
};

export type BreakdownGroup = {
  key: string;
  label: string;
  weightPct: number;
};

export type AboutStats = {
  breakdown: BreakdownHolding[];
  breakdownByMarketCap: BreakdownGroup[];
  breakdownBySector: BreakdownGroup[];
};

export type BacktestResult = {
  series: BacktestPoint[];
  totalReturnPct: number;
  maxDrawdownPct: number;
  benchmarkSeries: BacktestPoint[];
  benchmarkTotalReturnPct: number;
  benchmarkMaxDrawdownPct: number;
  about: AboutStats;
  score: {
    overall: number;
    returns: { score: number; totalReturnPct: number; cagr: number; avgAnnualReturn: number };
    stability: { score: number; maxDrawdownPct: number; avgDrawdownPct: number; avgDrawdownDurationDays: number };
    diversification: { score: number; positions: number; sectors: number; highestConcentration: { pct: number; ticker: string } };
  };
};
