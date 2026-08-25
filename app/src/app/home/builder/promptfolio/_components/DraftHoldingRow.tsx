'use client';

import type { CSSProperties } from 'react';
import { ASSET_UNIVERSE } from '../../_data';
import { donutColor } from '../../_shared/_build/Donut';
import type { AllocationRow } from '../../_shared/types';
import s from './DraftHoldingRow.module.css';

// Read-only counterpart to HoldingRow — no stepper/remove controls, since a Promptfolio draft is
// a passive preview until the user hands it off into the real builder.
export function DraftHoldingRow({ row, index, style }: { row: AllocationRow; index: number; style?: CSSProperties }) {
  const asset = ASSET_UNIVERSE.find((a) => a.ticker === row.ticker);

  return (
    <div className={s.row} style={style}>
      <span className={s.dot} style={{ background: donutColor(index) }} aria-hidden="true" />

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

      <span className={s.ticker}>{row.ticker}</span>
      <span className={s.name}>{asset?.name}</span>
      <span className={s.weight}>{row.weight}%</span>
    </div>
  );
}
