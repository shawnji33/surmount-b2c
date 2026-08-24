'use client';

import { useState } from 'react';
import { donutColor } from '@/app/home/builder/_shared/_build/Donut';
import { BarChart } from './BarChart';
import type { AllocationRow } from '@/app/home/builder/_shared/types';
import type { AboutStats, BreakdownGroup } from './_backtest-data';
import bt from '@/app/home/builder/_shared/BacktestPanel.module.css';
import s from './AboutCard.module.css';

type BreakdownView = 'asset' | 'marketCap' | 'sector';

const VIEWS: { key: BreakdownView; label: string }[] = [
  { key: 'asset', label: 'By asset' },
  { key: 'marketCap', label: 'By market cap' },
  { key: 'sector', label: 'By sector' },
];

export function AboutCard({ rows, totalWeight, about }: { rows: AllocationRow[]; totalWeight: number; about: AboutStats }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<BreakdownView>('asset');

  const groups: BreakdownGroup[] = view === 'asset'
    ? about.breakdown.map((holding) => ({ key: holding.ticker, label: holding.ticker, weightPct: holding.weightPct }))
    : view === 'marketCap'
      ? about.breakdownByMarketCap
      : about.breakdownBySector;

  // BarChart is keyed by ticker — for the grouped views this feeds it synthetic "rows" (group key
  // standing in for ticker) so the same stacked bar renders; the hover label just shows the group
  // key instead of a resolved asset name.
  const chartRows: AllocationRow[] = view === 'asset' ? rows : groups.map((g) => ({ ticker: g.key, weight: g.weightPct }));

  return (
    <div className={s.card}>
      <div className={s.head}>
        <h2 className={s.title}>Breakdown</h2>
        <div className={bt.rangeTabs}>
          {VIEWS.map((v) => (
            <button
              type="button"
              key={v.key}
              className={[bt.rangeTab, view === v.key ? bt.rangeTabActive : ''].filter(Boolean).join(' ')}
              onClick={() => { setView(v.key); setHovered(null); }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.body}>
        <div key={view} className={s.swapIn}>
          <BarChart rows={chartRows} totalWeight={totalWeight} hovered={hovered} onHover={setHovered} />
        </div>

        <div key={`${view}-list`} className={[s.list, s.swapIn].join(' ')}>
          {groups.map((g, i) => (
            <div
              key={g.key}
              className={[s.row, hovered === g.key ? s.rowActive : ''].filter(Boolean).join(' ')}
              onMouseEnter={() => setHovered(g.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={s.dot} style={{ background: donutColor(i) }} />
              <span className={s.rowTicker}>{g.label}</span>
              <span className={s.rowPct}>{g.weightPct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
