'use client';

import type { CSSProperties } from 'react';
import { breakdownColor } from '../_build/Donut';
import type { AllocationRow } from '../types';
import s from './BarChart.module.css';

// Flat segmented breakdown bar — solid color fills with a small gap between segments, rounded
// only on the two outer ends. Hovering (or tapping — the row list drives the same hovered state)
// lifts that segment slightly, dims the rest, and shows "TICKER · N%".
export function BarChart({
  rows,
  totalWeight,
  hovered,
  onHover,
}: {
  rows: AllocationRow[];
  totalWeight: number;
  hovered: string | null;
  onHover: (ticker: string | null) => void;
}) {
  const denom = Math.max(totalWeight, 1);
  const visible = rows.filter((r) => r.weight > 0);
  const anyHovered = hovered !== null;

  return (
    <div className={s.wrap}>
      <div className={s.track}>
        {visible.map((row, i) => {
          const pct = (row.weight / denom) * 100;
          const active = hovered === row.ticker;
          return (
            <button
              type="button"
              key={row.ticker}
              className={s.segment}
              style={{ width: `${pct}%`, '--seg-color': breakdownColor(i) } as CSSProperties}
              data-active={active}
              data-dimmed={anyHovered && !active}
              onMouseEnter={() => onHover(row.ticker)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(row.ticker)}
              onBlur={() => onHover(null)}
              aria-label={`${row.ticker}, ${Math.round(pct)}%`}
            >
              {active && <span className={s.tooltip}>{row.ticker} · {Math.round(pct)}%</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
