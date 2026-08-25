import { ASSET_UNIVERSE } from '@/app/home/builder/_data';
import type { Asset } from '@/app/home/builder/_shared/types';

/* Advanced-filter fields the real Asset type doesn't have yet (see conversation this session —
 * ~/Surmount/B2C/app/src/app/home/builder/_shared/types.ts only carries ticker/name/industry/
 * price/returnPct/logo/fallbackColor). This is throwaway prototype data, extending the real
 * ASSET_UNIVERSE rather than forking it, so both variants filter over the exact same 51 tickers
 * the shipped builder already uses. */

export type AssetClass = 'stock' | 'etf';
export type MarketCapBucket = 'large' | 'mid' | 'small';

export type EnrichedAsset = Asset & {
  assetClass: AssetClass;
  marketCap: MarketCapBucket;
  dividendYieldPct: number;
  peRatio: number | null;
  expenseRatioPct: number | null;
  aumBillions: number | null;
  category: string | null;
};

const ETF_TICKERS = new Set(['SPY', 'QQQ', 'VTI', 'VOO']);

/* Hand-curated for the names anyone reviewing this would recognize — realistic enough that a
 * "dividend yield > 3%" or "P/E < 15" filter produces a believable, non-random split. */
const OVERRIDES: Record<string, Partial<EnrichedAsset>> = {
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

/* Stable string hash → deterministic fallback values for every ticker not hand-curated above, so
 * the full 51-asset universe is fully populated for filtering without hand-typing every row. */
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

export const ENRICHED_ASSETS: EnrichedAsset[] = ASSET_UNIVERSE.map((asset) => {
  const isEtf = ETF_TICKERS.has(asset.ticker);
  const override = OVERRIDES[asset.ticker] ?? {};
  return {
    ...asset,
    assetClass: isEtf ? 'etf' : 'stock',
    marketCap: override.marketCap ?? deriveMarketCap(asset.ticker),
    dividendYieldPct: override.dividendYieldPct ?? (isEtf ? 1.3 : deriveDividendYield(asset.ticker)),
    peRatio: isEtf ? null : (override.peRatio !== undefined ? override.peRatio : derivePE(asset.ticker)),
    expenseRatioPct: isEtf ? (override.expenseRatioPct ?? 0.15) : null,
    aumBillions: isEtf ? (override.aumBillions ?? 5) : null,
    category: isEtf ? (override.category ?? 'Index') : null,
  };
});

export type AssetFilterState = {
  query: string;
  industry: string | null;
  assetClass: AssetClass | 'all';
  maxPrice: number | null;
  marketCap: MarketCapBucket | 'all';
  minDividendYieldPct: number;
  maxPE: number | null;
  maxExpenseRatioPct: number | null;
  minAumBillions: number | null;
};

export const DEFAULT_ASSET_FILTERS: AssetFilterState = {
  query: '',
  industry: null,
  assetClass: 'all',
  maxPrice: null,
  marketCap: 'all',
  minDividendYieldPct: 0,
  maxPE: null,
  maxExpenseRatioPct: null,
  minAumBillions: null,
};

function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, '')) || 0;
}

export function filterAssets(assets: EnrichedAsset[], filters: AssetFilterState): EnrichedAsset[] {
  const q = filters.query.trim().toLowerCase();
  return assets.filter((a) => {
    if (q && !a.ticker.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
    if (filters.industry && a.industry !== filters.industry) return false;
    if (filters.assetClass !== 'all' && a.assetClass !== filters.assetClass) return false;
    if (filters.maxPrice !== null && parsePrice(a.price) > filters.maxPrice) return false;
    if (filters.marketCap !== 'all' && a.assetClass === 'stock' && a.marketCap !== filters.marketCap) return false;
    if (filters.minDividendYieldPct > 0 && a.dividendYieldPct < filters.minDividendYieldPct) return false;
    if (filters.maxPE !== null && a.assetClass === 'stock' && (a.peRatio === null || a.peRatio > filters.maxPE)) return false;
    if (filters.maxExpenseRatioPct !== null && a.assetClass === 'etf' && (a.expenseRatioPct ?? 0) > filters.maxExpenseRatioPct) return false;
    if (filters.minAumBillions !== null && a.assetClass === 'etf' && (a.aumBillions ?? 0) < filters.minAumBillions) return false;
    return true;
  });
}

export function countActiveFilters(filters: AssetFilterState): number {
  let count = 0;
  if (filters.industry) count += 1;
  if (filters.assetClass !== 'all') count += 1;
  if (filters.maxPrice !== null) count += 1;
  if (filters.marketCap !== 'all') count += 1;
  if (filters.minDividendYieldPct > 0) count += 1;
  if (filters.maxPE !== null) count += 1;
  if (filters.maxExpenseRatioPct !== null) count += 1;
  if (filters.minAumBillions !== null) count += 1;
  return count;
}
