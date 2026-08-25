'use client';

import { Plus } from '@phosphor-icons/react';
import { Button as DsButton } from '@/components/Button';
import type { EnrichedAsset } from './_data';
import s from './AssetRow.module.css';

function metaLine(asset: EnrichedAsset): string {
  if (asset.assetClass === 'etf') {
    const expense = asset.expenseRatioPct !== null ? `${asset.expenseRatioPct.toFixed(2)}% expense` : '—';
    const aum = asset.aumBillions !== null ? `$${asset.aumBillions}B AUM` : '—';
    return `${expense} · ${aum}`;
  }
  const div = asset.dividendYieldPct > 0 ? `${asset.dividendYieldPct.toFixed(1)}% yield` : 'No dividend';
  const pe = asset.peRatio !== null ? `P/E ${asset.peRatio}` : 'P/E —';
  return `${div} · ${pe}`;
}

export function AssetRow({
  asset,
  selected,
  onToggle,
  compact = false,
}: {
  asset: EnrichedAsset;
  selected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <div className={[s.row, compact ? s.compact : ''].filter(Boolean).join(' ')}>
      <span className={s.logo}>
        {asset.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.logo} alt="" />
        ) : (
          <span className={s.logoFallback} style={{ background: asset.fallbackColor }}>
            {asset.ticker.slice(0, 2)}
          </span>
        )}
      </span>

      <span className={s.rowText}>
        <span className={s.rowTitle}>
          {asset.ticker} · {asset.name}
          <span className={s.classBadge} data-class={asset.assetClass}>{asset.assetClass === 'etf' ? 'ETF' : 'Stock'}</span>
        </span>
        <span className={s.rowSub}>
          {asset.price}
          <span className={asset.positive ? s.pos : s.neg}> {asset.returnPct} today</span>
          {!compact && <span className={s.metaDivider}>·</span>}
          {!compact && <span className={s.meta}>{metaLine(asset)}</span>}
        </span>
      </span>

      <DsButton
        type="button"
        variant={selected ? 'primary' : 'secondary'}
        fullWidth={false}
        iconTrailing={<Plus weight="regular" />}
        onClick={onToggle}
        aria-pressed={selected}
        className={s.selectBtn}
      >
        {selected ? 'Added' : 'Add'}
      </DsButton>
    </div>
  );
}
