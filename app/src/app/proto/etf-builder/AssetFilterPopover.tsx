'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from '@phosphor-icons/react';
import type { AssetFilterState, MarketCapBucket } from './_data';
import { countActiveFilters } from './_data';
import s from './AssetFilterPopover.module.css';

const PRICE_CHIPS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: 'Under $50', value: 50 },
  { label: 'Under $100', value: 100 },
  { label: 'Under $250', value: 250 },
  { label: 'Under $500', value: 500 },
];

const MARKET_CAP_CHIPS: { label: string; value: MarketCapBucket | 'all' }[] = [
  { label: 'Any', value: 'all' },
  { label: 'Large cap', value: 'large' },
  { label: 'Mid cap', value: 'mid' },
  { label: 'Small cap', value: 'small' },
];

const YIELD_CHIPS: { label: string; value: number }[] = [
  { label: 'Any', value: 0 },
  { label: '1%+', value: 1 },
  { label: '2%+', value: 2 },
  { label: '3%+', value: 3 },
  { label: '5%+', value: 5 },
];

const PE_CHIPS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: 'Under 15', value: 15 },
  { label: 'Under 25', value: 25 },
  { label: 'Under 40', value: 40 },
];

const EXPENSE_CHIPS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: 'Under 0.10%', value: 0.1 },
  { label: 'Under 0.25%', value: 0.25 },
  { label: 'Under 0.50%', value: 0.5 },
];

const AUM_CHIPS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: '$1B+', value: 1 },
  { label: '$10B+', value: 10 },
  { label: '$100B+', value: 100 },
];

function ChipGroup<T>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className={s.section}>
      <div className={s.sectionLabel}>{label}</div>
      <div className={s.chipRow}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              type="button"
              key={String(opt.value)}
              className={[s.chip, active ? s.chipActive : ''].filter(Boolean).join(' ')}
              aria-pressed={active}
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const FADE_SIZE = 28;

export function AssetFilterPopover({
  filters,
  onChange,
  compact = false,
}: {
  filters: AssetFilterState;
  onChange: (updater: (prev: AssetFilterState) => AssetFilterState) => void;
  /** Shrinks the trigger to match a 32px-tall compact search bar (InlineAddAsset, FloatingAddWindow)
   * instead of the default 44px that matches PickStep's full-size ClearableSearchInput. The 44px
   * touch target is preserved either way, via a pseudo-element hit-area on the compact variant. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveFilters(filters);
  const showStockFields = filters.assetClass !== 'etf';
  const showEtfFields = filters.assetClass !== 'stock';

  useEffect(() => setMounted(true), []);

  // Scroll-aware fade — same technique as PickStep's list: only show a fade edge once there's
  // actually more content in that direction, re-measured whenever the panel opens or its content
  // changes shape (asset-class toggle hides/shows sections and changes the scrollable height).
  useEffect(() => {
    if (!open) return undefined;
    const el = scrollRef.current;
    if (!el) return undefined;
    function update() {
      if (!el) return;
      setFadeTop(el.scrollTop > 2);
      setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open, showStockFields, showEtfFields]);

  function measure() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setCoords({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onDocPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current && !panelRef.current.contains(target)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function clearAll() {
    onChange((prev) => ({
      ...prev,
      maxPrice: null,
      marketCap: 'all',
      minDividendYieldPct: 0,
      maxPE: null,
      maxExpenseRatioPct: null,
      minAumBillions: null,
    }));
  }

  const topStop = fadeTop ? `transparent 0px, black ${FADE_SIZE}px` : `black 0px, black ${FADE_SIZE}px`;
  const bottomStop = fadeBottom
    ? `black calc(100% - ${FADE_SIZE}px), transparent 100%`
    : `black calc(100% - ${FADE_SIZE}px), black 100%`;
  const scrollMaskImage = `linear-gradient(to bottom, ${topStop}, ${bottomStop})`;

  const panel = (
    <div
      ref={panelRef}
      className={s.panel}
      data-open={open}
      inert={!open}
      style={{ top: coords.top, right: coords.right }}
    >
      <div
        className={s.scrollArea}
        ref={scrollRef}
        style={{ WebkitMaskImage: scrollMaskImage, maskImage: scrollMaskImage }}
      >
        <ChipGroup label="Price" options={PRICE_CHIPS} value={filters.maxPrice} onSelect={(v) => onChange((prev) => ({ ...prev, maxPrice: v }))} />
        {showStockFields && (
          <ChipGroup
            label="Market cap"
            options={MARKET_CAP_CHIPS}
            value={filters.marketCap}
            onSelect={(v) => onChange((prev) => ({ ...prev, marketCap: v }))}
          />
        )}
        <ChipGroup
          label="Dividend yield"
          options={YIELD_CHIPS}
          value={filters.minDividendYieldPct}
          onSelect={(v) => onChange((prev) => ({ ...prev, minDividendYieldPct: v }))}
        />
        {showStockFields && (
          <ChipGroup label="P/E ratio" options={PE_CHIPS} value={filters.maxPE} onSelect={(v) => onChange((prev) => ({ ...prev, maxPE: v }))} />
        )}
        {showEtfFields && (
          <ChipGroup
            label="Expense ratio"
            options={EXPENSE_CHIPS}
            value={filters.maxExpenseRatioPct}
            onSelect={(v) => onChange((prev) => ({ ...prev, maxExpenseRatioPct: v }))}
          />
        )}
        {showEtfFields && (
          <ChipGroup
            label="Fund size"
            options={AUM_CHIPS}
            value={filters.minAumBillions}
            onSelect={(v) => onChange((prev) => ({ ...prev, minAumBillions: v }))}
          />
        )}
      </div>

      <div className={s.footer}>
        <button type="button" className={s.clearAll} onClick={clearAll} disabled={activeCount === 0}>
          Clear all
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={s.trigger}
        data-compact={compact || undefined}
        aria-label={`Filters${activeCount > 0 ? `, ${activeCount} applied` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal weight="regular" />
        {activeCount > 0 && <span className={s.dot} aria-hidden="true" />}
      </button>

      {mounted && createPortal(panel, document.body)}
    </>
  );
}
