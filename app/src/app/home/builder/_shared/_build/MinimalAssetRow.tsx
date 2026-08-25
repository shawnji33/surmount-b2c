'use client';

import { Plus } from '@phosphor-icons/react';
import type { Asset } from '../types';
import s from './MinimalAssetRow.module.css';

export function MinimalAssetRow({
  asset,
  selected,
  onToggle,
}: {
  asset: Asset;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={s.row}>
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
      <span className={s.rowTicker}>{asset.ticker}</span>
      <span className={s.rowReturn}>
        <span className={asset.positive ? s.pos : s.neg}>{asset.returnPct}</span> today
      </span>
      <button
        type="button"
        className={[s.addBtn, selected ? s.addBtnActive : ''].filter(Boolean).join(' ')}
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${asset.ticker}` : `Add ${asset.ticker}`}
      >
        <Plus weight="bold" />
      </button>
    </div>
  );
}
