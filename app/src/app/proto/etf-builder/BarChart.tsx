'use client';

import type { CSSProperties } from 'react';
import { donutColor } from '@/app/home/builder/_shared/_build/Donut';
import type { AllocationRow } from '@/app/home/builder/_shared/types';
import s from './BarChart.module.css';

// Robinhood-style isometric breakdown bar: each segment is a front face plus two CSS-only
// pseudo-element faces (::before = top, lighter; ::after = right, darker), skewed to fake a 3D
// extrusion. Segments sit with zero gap in DOM order, so each one's protruding right face is
// naturally painted over by the next segment's front face — only thin top-face slivers show at
// each color boundary, and a full end-cap shows only on the last segment. No drop shadow.
// Hovering (or tapping — the row list drives the same hovered state) lifts that segment straight
// up (not scaled, so the skewed faces don't distort), dims the rest, and shows "TICKER · N%".
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
              style={{ width: `${pct}%`, '--seg-color': donutColor(i) } as CSSProperties}
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
