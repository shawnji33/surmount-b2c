'use client';

import { CaretDown } from '@phosphor-icons/react';
import type { HeatmapData } from '../_data';
import s from '../page.module.css';

const CATEGORY_COLORS: Record<'base' | 'double' | 'skip', string[]> = {
  base: ['var(--color-utility-brand-200)', 'var(--color-utility-brand-400)', 'var(--color-utility-brand-600)'],
  double: ['var(--color-utility-purple-200)', 'var(--color-utility-purple-400)'],
  skip: ['var(--color-utility-yellow-200)', 'var(--color-utility-yellow-400)'],
};

function cellColor(category: 'base' | 'double' | 'skip', level: number): string {
  if (level === 0) return 'var(--color-bg-tertiary)';
  return CATEGORY_COLORS[category][level - 1];
}

export function ActivityHeatmap({ data }: { data: HeatmapData }) {
  return (
    <div className={s.activitySectionOuter}>
      <div className={s.activitySectionHeaderRow}>
        <span className={s.activitySectionTitle}>Activity</span>
        <button type="button" className={s.heatmapFilterPill}>
          {data.filterLabel}
          <CaretDown size={12} weight="bold" />
        </button>
      </div>

      <div className={s.activityWhiteCard}>
        <p className={s.heatmapTxCount}>
          <span className={s.heatmapTxCountStrong}>{data.totalTx}</span>
          {` transactions in ${data.periodLabel}`}
        </p>

        <div className={s.heatmapBody}>
          <div className={s.heatmapLegend}>
            <div className={s.heatmapLegendRow}>
              <span className={s.heatmapSwatch} style={{ background: CATEGORY_COLORS.base[1] }} />
              {data.legend.base}
            </div>
            <div className={s.heatmapLegendRow}>
              <span className={s.heatmapSwatch} style={{ background: 'var(--color-utility-purple-600)' }} />
              {data.legend.double}
            </div>
            <div className={s.heatmapLegendRow}>
              <span className={s.heatmapSwatch} style={{ background: CATEGORY_COLORS.skip[1] }} />
              {data.legend.skip}
            </div>
          </div>

          <div className={s.heatmapGridWrap}>
            <div className={s.heatmapMonths}>
              {data.months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            <div
              className={s.heatmapGrid}
              style={{ gridTemplateColumns: `repeat(${data.weeks.length}, 16px)` }}
            >
              {data.weeks.map((week, wi) => (
                <div
                  key={`base-${wi}`}
                  className={s.heatmapCell}
                  style={{ gridColumn: wi + 1, gridRow: 1, background: cellColor('base', week.base) }}
                />
              ))}
              {data.weeks.map((week, wi) => (
                <div
                  key={`double-${wi}`}
                  className={s.heatmapCell}
                  style={{ gridColumn: wi + 1, gridRow: 2, background: cellColor('double', week.double) }}
                />
              ))}
              {data.weeks.map((week, wi) => (
                <div
                  key={`skip-${wi}`}
                  className={s.heatmapCell}
                  style={{ gridColumn: wi + 1, gridRow: 3, background: cellColor('skip', week.skip) }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={s.heatmapDivider} aria-hidden="true" />

        <div className={s.heatmapFooter}>
          <div className={s.heatmapStats}>
            <span className={s.heatmapStat}>
              <strong>{data.stats.deployed}</strong> {data.stats.deployedLabel}
            </span>
            <span className={s.heatmapStatDot} aria-hidden="true">•</span>
            <span className={s.heatmapStat}>
              <strong>{data.stats.doubleBuys}</strong> {data.stats.doubleLabel}
            </span>
            <span className={s.heatmapStatDot} aria-hidden="true">•</span>
            <span className={s.heatmapStat}>
              <strong>{data.stats.skipped}</strong> {data.stats.skipLabel}
            </span>
          </div>
          <div className={s.heatmapScale}>
            Less
            <span className={s.heatmapScaleSwatch} style={{ background: 'var(--color-bg-tertiary)' }} />
            <span className={s.heatmapScaleSwatch} style={{ background: 'var(--color-utility-gray-300)' }} />
            <span className={s.heatmapScaleSwatch} style={{ background: 'var(--color-utility-gray-400)' }} />
            More
          </div>
        </div>
      </div>
    </div>
  );
}
