'use client';

import { TrashSimple } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '../../_data';
import type { AllocationRow } from '../../_shared/types';
import s from './HoldingsAllocationsTable.module.css';

const MARKET_CAP_LABEL: Record<string, string> = {
  large: 'Large-cap',
  mid: 'Mid-cap',
  small: 'Small-cap',
};

const RELEVANCE_BARS = 7;

// "Relevance" and "Reason" aren't fabricated per-ticker claims (the reference mockup's own text
// was about a different, unrelated dataset) — relevance is derived from the position's real
// weight relative to the largest one in the draft, and reason names the position's real rank
// within the matched strategy rather than inventing specific-sounding facts about the company.
function reasonFor(rank: number, templateName: string | null) {
  const strategy = templateName ?? 'this strategy';
  return rank === 0
    ? `Largest position — core driver of the ${strategy} exposure`
    : `Supporting position in the ${strategy} allocation`;
}

export function HoldingsAllocationsTable({
  rows,
  templateName,
  onRemove,
}: {
  rows: AllocationRow[];
  templateName: string | null;
  onRemove: (ticker: string) => void;
}) {
  const sorted = [...rows].sort((a, b) => b.weight - a.weight);
  const maxWeight = Math.max(...rows.map((r) => r.weight), 1);

  return (
    <div className={s.card}>
      <h2 className={s.title}>All holdings &amp; allocations</h2>

      <div className={s.headerRow}>
        <span>Asset</span>
        <span>Market cap</span>
        <span>Relevance</span>
        <span>Weight</span>
        <span>Reason</span>
        <span aria-hidden="true" />
      </div>

      <div className={s.rows}>
        {sorted.map((row, i) => {
          const asset = ASSET_UNIVERSE.find((a) => a.ticker === row.ticker);
          const filledBars = Math.max(1, Math.round((row.weight / maxWeight) * RELEVANCE_BARS));

          return (
            <div className={s.row} key={row.ticker}>
              <span className={s.assetCell}>
                <span className={s.avatar}>
                  {asset?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.logo} alt="" />
                  ) : (
                    <span className={s.avatarFallback} style={{ background: asset?.fallbackColor }}>
                      {row.ticker.slice(0, 2)}
                    </span>
                  )}
                </span>
                <span className={s.assetText}>
                  <span className={s.ticker}>{row.ticker}</span>
                  <span className={s.name}>{asset?.name}</span>
                </span>
              </span>

              <span className={s.cell}>{asset?.marketCap ? MARKET_CAP_LABEL[asset.marketCap] : '—'}</span>

              <span className={s.relevance} aria-label={`Relevance ${filledBars} of ${RELEVANCE_BARS}`}>
                {Array.from({ length: RELEVANCE_BARS }).map((_, barIndex) => (
                  <span key={barIndex} className={barIndex < filledBars ? s.barFilled : s.barEmpty} />
                ))}
              </span>

              <span className={s.cell}>{row.weight}%</span>

              <span className={[s.cell, s.reason].join(' ')}>{reasonFor(i, templateName)}</span>

              <button type="button" className={s.deleteBtn} aria-label={`Remove ${row.ticker}`} onClick={() => onRemove(row.ticker)}>
                <TrashSimple weight="regular" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
