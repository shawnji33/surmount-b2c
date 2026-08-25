import type { NodeInstance, ParamValue } from '../nodes/types';

/* ── §3 simulation contract — UI is decoupled from the engine. V1 is a
   clearly-labeled illustrative mock; swap in a real backtest later. ── */

export type SimWindow = '3M' | '6M' | '1Y';

export interface PricePoint {
  t: string;
  value: number;
}
export interface TriggerPoint {
  t: string;
  i: number; // index into the series (for chart placement)
  price: number;
  action: string;
}
export interface SimulationResult {
  triggerCount: number;
  totalInvested: number;
  estReturn: number; // percent
  series: PricePoint[]; // asset price path (seeded by window — stable across param edits)
  equityCurve: PricePoint[]; // hypothetical portfolio value (responds to param edits → curve morphs)
  triggerPoints: TriggerPoint[];
  window: SimWindow;
  computedAt: string;
  isMock: boolean;
}
export interface SimulationInput {
  steps: NodeInstance[];
  window: SimWindow;
  asOf?: string;
}

const TRADING_DAYS: Record<SimWindow, number> = { '3M': 64, '6M': 128, '1Y': 252 };

export const WINDOW_LABEL: Record<SimWindow, string> = {
  '3M': '3 months',
  '6M': '6 months',
  '1Y': 'the past year',
};

/* deterministic RNG so the price path is stable while only params change */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function param(steps: NodeInstance[], id: string, key: string, fallback: ParamValue): ParamValue {
  return steps.find((n) => n.id === id)?.params[key] ?? fallback;
}

const round = (n: number) => Math.round(n * 100) / 100;

export async function runSimulation(input: SimulationInput): Promise<SimulationResult> {
  const { steps, window } = input;
  const days = TRADING_DAYS[window];
  const asset = String(param(steps, 'price', 'asset', 'NVDA') || 'NVDA');

  // ── seeded price path (depends only on asset + window) ──
  const rng = mulberry32(hashStr(`${asset}:${window}`));
  const asOf = input.asOf ? new Date(input.asOf) : new Date();
  const series: PricePoint[] = [];
  const bars: { open: number; low: number; close: number }[] = [];
  let price = 118;
  for (let i = 0; i < days; i++) {
    const open = price;
    const shock = rng() * 2 - 1;
    const low = open * (1 - Math.abs(shock) * 0.06); // intraday dip
    const close = open * (1 + shock * 0.022 + 0.0007); // mild upward drift
    price = close;
    const d = new Date(asOf);
    d.setDate(d.getDate() - (days - i));
    series.push({ t: d.toISOString().slice(0, 10), value: round(close) });
    bars.push({ open, low, close });
  }

  // ── strategy params ──
  const dropPct = Number(param(steps, 'cond', 'rightValue', 5)) || 0;
  const buyAmt = Number(param(steps, 'trade', 'amount', 2000)) || 0;
  const capAmt = Number(param(steps, 'cap', 'capAmount', 4000)) || Infinity;
  const compareTo = String(param(steps, 'cond', 'compareTo', 'the open'));

  // ── walk the path, fire the strategy, accumulate equity ──
  let invested = 0;
  let shares = 0;
  let weekKey = -1;
  let weekSpend = 0;
  const triggerPoints: TriggerPoint[] = [];
  const equityCurve: PricePoint[] = [];

  for (let i = 0; i < days; i++) {
    const { open, low, close } = bars[i];
    const ref = compareTo === 'prior close' && i > 0 ? series[i - 1].value : open;
    const dropFromRef = ((ref - low) / ref) * 100;

    const wk = Math.floor(i / 5);
    if (wk !== weekKey) {
      weekKey = wk;
      weekSpend = 0;
    }

    if (dropPct > 0 && buyAmt > 0 && dropFromRef >= dropPct && weekSpend + buyAmt <= capAmt) {
      const fillPrice = ref * (1 - dropPct / 100);
      shares += buyAmt / fillPrice;
      invested += buyAmt;
      weekSpend += buyAmt;
      triggerPoints.push({ t: series[i].t, i, price: round(fillPrice), action: 'Buy' });
    }
    equityCurve.push({ t: series[i].t, value: round(shares * close) });
  }

  const finalValue = shares * price;
  const estReturn = invested > 0 ? ((finalValue - invested) / invested) * 100 : 0;

  // simulate engine latency a touch in dev
  await Promise.resolve();

  return {
    triggerCount: triggerPoints.length,
    totalInvested: Math.round(invested),
    estReturn: round(estReturn),
    series,
    equityCurve,
    triggerPoints,
    window,
    computedAt: new Date().toISOString(),
    isMock: true,
  };
}
