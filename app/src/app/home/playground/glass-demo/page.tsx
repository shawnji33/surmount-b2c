'use client';

import { CaretLeft, ChartLineUp, MagnifyingGlass } from '@phosphor-icons/react';
import { cx } from '@/utils/cx';
import s from './page.module.css';

export default function GlassDemoPage() {
  return (
    <div className={s.page}>
      <div className={s.backdrop}>
        <div className={cx('glass-surface', 'glass-surface--circle', s.navCircle)}>
          <CaretLeft size={18} weight="bold" />
        </div>

        <div className={cx('glass-surface', 'glass-surface--pill', s.navPill)}>
          <span className={s.pillLabel}>Quantum Computing</span>
          <span className={s.pillValue}>+8.50%</span>
        </div>

        <div className={cx('glass-surface', 'glass-surface--circle', s.navCircleRight)}>
          <MagnifyingGlass size={18} weight="bold" />
        </div>

        <div className={cx('glass-surface', 'glass-surface--card', s.tradeCard)}>
          <div className={s.tradeRow}>
            <div className={s.brokerChip}>
              <ChartLineUp size={16} weight="bold" />
              <span>Alpaca</span>
            </div>
            <button type="button" className={s.tradeBtn}>Trade</button>
          </div>
        </div>
      </div>

      <p className={s.caption}>
        Same <code>.glass-surface</code> utility, three shape modifiers (circle / pill / card) —
        floating over a gradient so the blur actually has something to catch.
      </p>
    </div>
  );
}
