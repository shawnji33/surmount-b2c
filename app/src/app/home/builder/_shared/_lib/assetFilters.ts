import type { Asset, AssetFilterState } from '../types';

export const DEFAULT_ASSET_FILTERS: AssetFilterState = {
  query: '',
  industries: [],
  assetClass: 'all',
  maxPrice: null,
  marketCap: 'all',
  minDividendYieldPct: 0,
  maxPE: null,
  maxExpenseRatioPct: null,
  minAumBillions: null,
};

export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, '')) || 0;
}

export function filterAssets(assets: Asset[], filters: AssetFilterState): Asset[] {
  const q = filters.query.trim().toLowerCase();
  return assets.filter((a) => {
    if (q && !a.ticker.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
    if (filters.industries.length > 0 && !filters.industries.includes(a.industry)) return false;
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
  if (filters.industries.length > 0) count += 1;
  if (filters.assetClass !== 'all') count += 1;
  if (filters.maxPrice !== null) count += 1;
  if (filters.marketCap !== 'all') count += 1;
  if (filters.minDividendYieldPct > 0) count += 1;
  if (filters.maxPE !== null) count += 1;
  if (filters.maxExpenseRatioPct !== null) count += 1;
  if (filters.minAumBillions !== null) count += 1;
  return count;
}
