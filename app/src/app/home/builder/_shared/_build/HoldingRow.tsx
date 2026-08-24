'use client';

import { Minus, Plus, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ASSET_UNIVERSE } from '../../_data';
import type { AllocationRow } from '../types';
import s from './HoldingRow.module.css';

export function HoldingRow({
  row,
  color,
  dimmed,
  onHover,
  onWeight,
  onRemove,
  entering = false,
  exiting = false,
  weightLoading = false,
  resettingWeightLoader = false,
}: {
  row: AllocationRow;
  color: string;
  dimmed: boolean;
  entering?: boolean;
  exiting?: boolean;
  onHover: (on: boolean) => void;
  onWeight: (weight: number) => void;
  onRemove: () => void;
  weightLoading?: boolean;
  resettingWeightLoader?: boolean;
}) {
  const asset = ASSET_UNIVERSE.find((a) => a.ticker === row.ticker);

  return (
    <div
      className={[s.row, dimmed ? s.dimmed : '', entering ? s.entering : '', exiting ? s.exiting : ''].filter(Boolean).join(' ')}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <span className={s.dot} style={{ background: color }} aria-hidden="true" />

      <div className={s.text}>
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
      </div>

      <div className={[s.tSkel, weightLoading ? '' : s.isRevealed, resettingWeightLoader ? s.isResetting : ''].filter(Boolean).join(' ')}>
        <div className={[s.tSkelSkeleton, weightLoading ? s.isPulsing : ''].filter(Boolean).join(' ')} aria-hidden="true">
          <div className={s.weightSkeleton} />
        </div>
        <div className={s.tSkelContent}>
          <div className={s.stepper}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onWeight(Math.max(0, row.weight - 5))}
              disabled={weightLoading || row.weight <= 0}
              aria-label={`Decrease ${row.ticker} by 5%`}
              className={s.stepBtn}
            >
              <Minus weight="regular" />
            </Button>
            <div className={s.inputWrap}>
              <input
                className={s.input}
                value={row.weight}
                inputMode="numeric"
                aria-label={`${row.ticker} weight percent`}
                disabled={weightLoading}
                onChange={(e) => {
                  const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  onWeight(Number.isNaN(n) ? 0 : Math.min(100, n));
                }}
              />
              <span className={s.percentSign}>%</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onWeight(Math.min(100, row.weight + 5))}
              disabled={weightLoading || row.weight >= 100}
              aria-label={`Increase ${row.ticker} by 5%`}
              className={s.stepBtn}
            >
              <Plus weight="regular" />
            </Button>
          </div>
        </div>
      </div>

      <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Remove ${row.ticker}`}>
        <X weight="bold" />
      </Button>
    </div>
  );
}
