import { ASSET_UNIVERSE } from '../../_data';
import type { Asset, AllocationRow, BacktestPoint, BacktestResult, BreakdownGroup } from '../types';

/* Deterministic mulberry32 PRNG — same seed always produces the same synthetic series, so
 * re-running a backtest with the same inputs looks stable rather than jittering randomly. */
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
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return h || 1;
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthsBetween(start: Date, end: Date) {
  return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
}

/* Synthetic S&P 500 comparison series — same PRNG technique as the asset series (deterministic
 * per seed), just with its own drift/volatility so it reads as a distinct, lower-variance line. */
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

const MARKET_CAP_LABELS: Record<string, string> = { large: 'Large cap', mid: 'Mid cap', small: 'Small cap', etf: 'ETF' };
const MARKET_CAP_ORDER = ['large', 'mid', 'small', 'etf'];

function groupByWeight<K extends string>(
  enrichedRows: { row: AllocationRow; asset: Asset }[],
  keyOf: (asset: Asset) => K,
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

export function generateBacktestResult(seedInput: string, start: Date, end: Date, rows: AllocationRow[]): BacktestResult {
  const positions = rows.length;
  const rand = mulberry32(hashSeed(seedInput));
  const months = monthsBetween(start, end);

  let value = 100000;
  let peak = value;
  const series: BacktestPoint[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  for (let i = 0; i <= months; i++) {
    if (i > 0) {
      const drift = 0.008;
      const vol = 0.045;
      const shock = gaussian(rand) * vol;
      value = Math.max(1000, value * (1 + drift + shock));
    }
    peak = Math.max(peak, value);
    const drawdownPct = peak > 0 ? ((value - peak) / peak) * 100 : 0;
    series.push({ time: fmtDate(cursor), value: Math.round(value * 100) / 100, drawdownPct: Math.round(drawdownPct * 100) / 100 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const first = series[0]?.value ?? 100000;
  const last = series[series.length - 1]?.value ?? first;
  const totalReturnPct = ((last - first) / first) * 100;
  const maxDrawdownPct = Math.min(...series.map((p) => p.drawdownPct), 0);
  const years = Math.max(months / 12, 0.25);
  const cagr = (Math.pow(Math.max(last, 1) / first, 1 / years) - 1) * 100;
  const avgAnnualReturn = totalReturnPct / years;

  const avgDrawdownPct = series.reduce((sum, p) => sum + p.drawdownPct, 0) / series.length;
  const avgDrawdownDurationDays = Math.round(14 + Math.abs(avgDrawdownPct) * 1.6);

  const returnsScore = Math.max(0, Math.min(1, 0.5 + totalReturnPct / 200));
  const stabilityScore = Math.max(0, Math.min(1, 1 + maxDrawdownPct / 60));
  const diversificationScore = Math.max(0, Math.min(1, positions / 12));
  const overall = Math.round(((returnsScore + stabilityScore + diversificationScore) / 3) * 100) / 100;

  const benchmark = generateBenchmarkSeries(seedInput, months, series);

  const enrichedRows = rows
    .map((row) => ({ row, asset: ASSET_UNIVERSE.find((a) => a.ticker === row.ticker) }))
    .filter((r): r is { row: AllocationRow; asset: Asset } => Boolean(r.asset));

  const breakdownByMarketCap = groupByWeight(enrichedRows, (asset) => asset.marketCap ?? 'etf', (key) => MARKET_CAP_LABELS[key] ?? key, MARKET_CAP_ORDER);
  const breakdownBySector = groupByWeight(enrichedRows, (asset) => asset.industry, (key) => key);

  const sortedRows = [...rows].sort((a, b) => b.weight - a.weight);
  const breakdown = sortedRows.map((row) => {
    const asset = ASSET_UNIVERSE.find((a) => a.ticker === row.ticker);
    return {
      ticker: row.ticker,
      name: asset?.name ?? row.ticker,
      weightPct: Math.round(row.weight * 100) / 100,
      logo: asset?.logo,
      fallbackColor: asset?.fallbackColor ?? 'var(--color-fg-tertiary-600)',
    };
  });
  const highestConcentration = sortedRows[0]
    ? { pct: Math.round(sortedRows[0].weight * 100) / 100, ticker: sortedRows[0].ticker }
    : { pct: 0, ticker: '—' };

  return {
    series,
    totalReturnPct: Math.round(totalReturnPct * 100) / 100,
    maxDrawdownPct: Math.round(maxDrawdownPct * 100) / 100,
    benchmarkSeries: benchmark.points,
    benchmarkTotalReturnPct: benchmark.totalReturnPct,
    benchmarkMaxDrawdownPct: benchmark.maxDrawdownPct,
    about: {
      breakdown,
      breakdownByMarketCap,
      breakdownBySector,
    },
    score: {
      overall,
      returns: {
        score: Math.round(returnsScore * 100) / 100,
        totalReturnPct: Math.round(totalReturnPct * 100) / 100,
        cagr: Math.round(cagr * 100) / 100,
        avgAnnualReturn: Math.round(avgAnnualReturn * 100) / 100,
      },
      stability: {
        score: Math.round(stabilityScore * 100) / 100,
        maxDrawdownPct: Math.round(maxDrawdownPct * 100) / 100,
        avgDrawdownPct: Math.round(avgDrawdownPct * 100) / 100,
        avgDrawdownDurationDays,
      },
      diversification: {
        score: Math.round(diversificationScore * 100) / 100,
        positions,
        sectors: Math.max(1, Math.round(positions * 0.8)),
        highestConcentration,
      },
    },
  };
}
