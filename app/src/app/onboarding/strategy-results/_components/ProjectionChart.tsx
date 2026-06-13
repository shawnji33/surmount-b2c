'use client';

import { type CSSProperties, type PointerEvent } from 'react';
import { type ProjectionPoint } from '../_data';
import { formatCompactMoney, formatMoney } from '../_helpers';
import s from '../page.module.css';

export function ProjectionChart({
  points,
  activeIndex,
  onActiveIndexChange,
}: {
  points: ProjectionPoint[];
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1) * 1.08;
  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 68 - (point.value / maxValue) * 62;
    return { ...point, x, y };
  });
  const path = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const activePoint = activeIndex == null ? null : coordinates[activeIndex];

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onActiveIndexChange(Math.round(ratio * (points.length - 1)));
  };

  return (
    <div
      className={s.chartWrap}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onActiveIndexChange(null)}
      aria-label="Projected portfolio value chart"
    >
      <svg className={s.chart} viewBox="0 0 100 72" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="projection-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(64,106,208,0.24)" />
            <stop offset="100%" stopColor="rgba(64,106,208,0)" />
          </linearGradient>
        </defs>
        <path className={s.chartFill} d={`${path} L 100 72 L 0 72 Z`} fill="url(#projection-fill)" />
        <path className={s.chartLine} d={path} fill="none" stroke="#406ad0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        {activePoint && (
          <>
            <line
              className={s.chartHoverLine}
              x1={activePoint.x}
              x2={activePoint.x}
              y1="4"
              y2="70"
              vectorEffect="non-scaling-stroke"
            />
            <circle className={s.chartHoverDot} cx={activePoint.x} cy={activePoint.y} r="2.4" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {activePoint && (
        <div
          className={s.chartTooltip}
          style={{
            left: `${activePoint.x}%`,
            top: `${activePoint.y}%`,
          } as CSSProperties}
        >
          <span>{activePoint.label}</span>
          <strong>{formatMoney(activePoint.value)}</strong>
          <small>Contributions {formatCompactMoney(activePoint.contributions)} · Gains {formatCompactMoney(activePoint.gains)}</small>
        </div>
      )}
    </div>
  );
}
