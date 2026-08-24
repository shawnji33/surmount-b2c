import { generateBacktestResult } from '@/app/home/builder/_shared/_lib/generateBacktestResult';
import type { AllocationRow, BacktestPoint, BacktestResult } from '@/app/home/builder/_shared/types';
import { ENRICHED_ASSETS, type EnrichedAsset } from './_data';

/* Extends the real generateBacktestResult (reused as-is, not modified) with the extra info from
 * the reference screenshots this was built from: a benchmark comparison series, and an "About"
 * section (portfolio-level fundamentals + breakdown by holding). The fundamentals are synthesized
 * the same way the rest of this mock data is (deterministic per seed) since there's no real market
 * data source here — see ENRICHED_ASSETS in ../_data.ts for the per-ticker fields they're derived
 * from (dividendYieldPct, peRatio, marketCap bucket). */

function mulberry32(seed: number) {
  let s = seed;
  return function rand() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return h || 1;
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

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

const MARKET_CAP_LABELS: Record<EnrichedAsset['marketCap'], string> = { large: 'Large cap', mid: 'Mid cap', small: 'Small cap' };
const MARKET_CAP_ORDER: EnrichedAsset['marketCap'][] = ['large', 'mid', 'small'];

function groupByWeight<K extends string>(
  enrichedRows: { row: AllocationRow; asset: EnrichedAsset }[],
  keyOf: (asset: EnrichedAsset) => K,
  labelOf: (key: K) => string,
  order?: K[],
): BreakdownGroup[] {
  const totals = new Map<K, number>();
  enrichedRows.forEach(({ row, asset }) => {
    const key = keyOf(asset);
    totals.set(key, (totals.get(key) ?? 0) + row.weight);
  });
  const keys = order ? order.filter((k) => totals.has(k)) : [...totals.keys()].sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));
  return keys.map((key) => ({ key, label: labelOf(key), weightPct: Math.round((totals.get(key) ?? 0) * 100) / 100 }));
}

export type AboutStats = {
  breakdown: BreakdownHolding[];
  breakdownByMarketCap: BreakdownGroup[];
  breakdownBySector: BreakdownGroup[];
};

export type EnrichedBacktestResult = BacktestResult & {
  benchmarkSeries: BacktestPoint[];
  benchmarkTotalReturnPct: number;
  benchmarkMaxDrawdownPct: number;
  about: AboutStats;
};

function generateBenchmarkSeries(seedInput: string, months: number, series: BacktestPoint[]): { points: BacktestPoint[]; totalReturnPct: number; maxDrawdownPct: number } {
  const rand = mulberry32(hashSeed(`${seedInput}|benchmark`));
  let value = 100000;
  let peak = value;
  const points: BacktestPoint[] = [];
  for (let i = 0; i <= months; i += 1) {
    if (i > 0) {
      const drift = 0.0055;
      const vol = 0.028;
      const shock = gaussian(rand) * vol;
      value = Math.max(1000, value * (1 + drift + shock));
    }
    peak = Math.max(peak, value);
    const drawdownPct = peak > 0 ? ((value - peak) / peak) * 100 : 0;
    points.push({ time: series[i]?.time ?? '', value: Math.round(value * 100) / 100, drawdownPct: Math.round(drawdownPct * 100) / 100 });
  }
  const first = points[0]?.value ?? 100000;
  const last = points[points.length - 1]?.value ?? first;
  return {
    points,
    totalReturnPct: Math.round(((last - first) / first) * 10000) / 100,
    maxDrawdownPct: Math.round(Math.min(...points.map((p) => p.drawdownPct), 0) * 100) / 100,
  };
}

export function generateEnrichedBacktestResult(seedInput: string, start: Date, end: Date, rows: AllocationRow[]): EnrichedBacktestResult {
  const base = generateBacktestResult(seedInput, start, end, rows);
  const months = base.series.length - 1;
  const benchmark = generateBenchmarkSeries(seedInput, months, base.series);

  const enrichedRows = rows
    .map((row) => ({ row, asset: ENRICHED_ASSETS.find((a) => a.ticker === row.ticker) }))
    .filter((r): r is { row: AllocationRow; asset: EnrichedAsset } => Boolean(r.asset));

  const breakdownByMarketCap = groupByWeight(enrichedRows, (asset) => asset.marketCap, (key) => MARKET_CAP_LABELS[key], MARKET_CAP_ORDER);
  const breakdownBySector = groupByWeight(enrichedRows, (asset) => asset.industry, (key) => key);

  const breakdown: BreakdownHolding[] = [...rows]
    .sort((a, b) => b.weight - a.weight)
    .map((row) => {
      const asset = ENRICHED_ASSETS.find((a) => a.ticker === row.ticker);
      return {
        ticker: row.ticker,
        name: asset?.name ?? row.ticker,
        weightPct: Math.round(row.weight * 100) / 100,
        logo: asset?.logo,
        fallbackColor: asset?.fallbackColor ?? 'var(--color-fg-tertiary-600)',
      };
    });

  return {
    ...base,
    benchmarkSeries: benchmark.points,
    benchmarkTotalReturnPct: benchmark.totalReturnPct,
    benchmarkMaxDrawdownPct: benchmark.maxDrawdownPct,
    about: {
      breakdown,
      breakdownByMarketCap,
      breakdownBySector,
    },
  };
}
