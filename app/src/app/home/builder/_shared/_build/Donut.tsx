'use client';

import { ASSET_UNIVERSE } from '../../_data';
import type { AllocationRow } from '../types';
import s from './Donut.module.css';

const TAU = Math.PI * 2;

// Categorical palette for the allocation donut — chart/data-viz context, so brand blue is
// allowed here even though it's excluded from UI chrome elsewhere in the app.
export const DONUT_COLORS = [
  'var(--color-utility-brand-600)',
  'var(--color-utility-success-600)',
  'var(--color-utility-warning-600)',
  'var(--color-fg-secondary-700)',
  'var(--color-utility-error-500)',
  'var(--color-fg-quaternary-400)',
  'var(--color-utility-brand-300)',
  'var(--color-utility-success-300)',
];

export function donutColor(index: number) {
  return DONUT_COLORS[index % DONUT_COLORS.length];
}

// Lighter categorical palette for the Breakdown bar chart specifically — pulled from the 300-500
// steps of each color's scale rather than DONUT_COLORS' 600/700s, so the flat segmented bar reads
// softer. Kept as its own list rather than changing DONUT_COLORS in place, so the allocation
// donut elsewhere on this page isn't affected by a request scoped to the Breakdown card.
export const BREAKDOWN_COLORS = [
  'var(--color-utility-brand-500)',
  'var(--color-utility-success-500)',
  'var(--color-utility-warning-500)',
  'var(--color-utility-gray-500)',
  'var(--color-utility-error-400)',
  'var(--color-utility-brand-300)',
  'var(--color-utility-success-300)',
  'var(--color-utility-gray-300)',
];

export function breakdownColor(index: number) {
  return BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length];
}

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// Filled annular-sector path with rounded corners — dash-array strokes can't round per-segment
// corners, so this builds the outline directly. Ported from quantbase's portfolio-builder-v2.tsx
// (generic geometry, not product-specific).
function sectorPath(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number, corner: number): string {
  const span = a1 - a0;
  const rr = Math.min(corner, (ro - ri) / 2);
  const po = Math.min(rr / ro, span / 2);
  const pi = Math.min(rr / ri, span / 2);
  const p = (r: number, a: number) => polar(cx, cy, r, a).map((v) => v.toFixed(2)).join(' ');
  const largeO = span - 2 * po > Math.PI ? 1 : 0;
  const largeI = span - 2 * pi > Math.PI ? 1 : 0;
  return [
    `M ${p(ro, a0 + po)}`,
    `A ${ro} ${ro} 0 ${largeO} 1 ${p(ro, a1 - po)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ro - rr, a1)}`,
    `L ${p(ri + rr, a1)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ri, a1 - pi)}`,
    `A ${ri} ${ri} 0 ${largeI} 0 ${p(ri, a0 + pi)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ri + rr, a0)}`,
    `L ${p(ro - rr, a0)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ro, a0 + po)}`,
    'Z',
  ].join(' ');
}

export function Donut({
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
  const SIZE = 200;
  const CX = SIZE / 2;
  const RO = 88;
  const RI = 62;
  const CORNER = 6;
  const GAP = 0.045;

  const denom = Math.max(totalWeight, 1);
  const visible = rows.filter((r) => r.weight > 0);
  const gap = visible.length > 1 ? GAP : 0;

  const segments: { row: AllocationRow; a0: number; a1: number; color: string }[] = [];
  {
    let angle = -Math.PI / 2;
    visible.forEach((row, i) => {
      const sweep = (row.weight / denom) * TAU;
      segments.push({
        row,
        a0: angle + gap / 2,
        a1: angle + Math.max(sweep - gap / 2, gap),
        color: donutColor(i),
      });
      angle += sweep;
    });
  }

  const hoveredIndex = hovered ? rows.findIndex((r) => r.ticker === hovered) : -1;
  const hoveredRow = hoveredIndex >= 0 ? rows[hoveredIndex] : null;
  const hoveredAsset = hovered ? ASSET_UNIVERSE.find((a) => a.ticker === hovered) : null;

  return (
    <div className={s.wrap} style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Portfolio allocation">
        <circle cx={CX} cy={CX} r={(RO + RI) / 2} fill="none" stroke="var(--color-bg-tertiary)" strokeWidth={RO - RI} />
        {segments.map(({ row, a0, a1, color }) => {
          const active = hovered === row.ticker;
          const grow = active ? 4 : 0;
          return (
            <path
              key={row.ticker}
              d={sectorPath(CX, CX, RO + grow, RI - grow, a0, a1, CORNER)}
              fill={color}
              opacity={hovered !== null && !active ? 0.35 : 1}
              onMouseEnter={() => onHover(row.ticker)}
              onMouseLeave={() => onHover(null)}
              className={s.segment}
            />
          );
        })}
      </svg>

      <div className={s.centerLabel}>
        {hoveredAsset && hoveredRow ? (
          <>
            <p className={s.centerName}>
              <span className={s.centerDot} style={{ background: donutColor(hoveredIndex) }} />
              {hoveredAsset.ticker}
            </p>
            <p className={s.centerSub}>{Math.round((hoveredRow.weight / denom) * 100)}% of portfolio</p>
          </>
        ) : (
          <>
            <p className={s.centerTotal}>{Math.round(totalWeight)}%</p>
            <p className={s.centerSub}>allocated</p>
          </>
        )}
      </div>
    </div>
  );
}
