'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Equals, PencilSimple, SlidersHorizontal } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '../../_data';
import type { AllocationMethod, AllocationRow } from '../types';
import { Donut, donutColor } from './Donut';
import { HoldingRow } from './HoldingRow';
import { AddAssetPill } from './AddAssetPill';
import s from './AllocationSection.module.css';

const METHODS: { key: AllocationMethod; label: string; icon: React.ReactNode }[] = [
  { key: 'equal', label: 'Equal', icon: <Equals weight="regular" /> },
  { key: 'custom', label: 'Custom', icon: <SlidersHorizontal weight="regular" /> },
];

export function AllocationSection({
  name,
  setName,
  description,
  setDescription,
  rows,
  totalWeight,
  method,
  setMethod,
  setCustomWeight,
  removeAsset,
  selected,
  onToggleAsset,
}: {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  rows: AllocationRow[];
  totalWeight: number;
  method: AllocationMethod;
  setMethod: (m: AllocationMethod) => void;
  setCustomWeight: (ticker: string, weight: number) => void;
  removeAsset: (ticker: string) => void;
  selected: string[];
  onToggleAsset: (ticker: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [enteringTicker, setEnteringTicker] = useState<string | null>(null);
  const [exitingTickers, setExitingTickers] = useState<Set<string>>(new Set());
  const [equalWeightsLoading, setEqualWeightsLoading] = useState(false);
  const [resettingEqualWeights, setResettingEqualWeights] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Partial<Record<AllocationMethod, HTMLButtonElement | null>>>({});
  const isFirstPillPaint = useRef(true);
  const previousTickersRef = useRef(rows.map((row) => row.ticker));
  const equalTimerRef = useRef<number | null>(null);
  const exitTimersRef = useRef<Map<string, number>>(new Map());

  const balanced = Math.round(totalWeight) === 100;

  function movePill(animate: boolean) {
    const pill = pillRef.current;
    const activeTab = tabRefs.current[method];
    if (!pill || !activeTab) return;
    if (!animate) {
      const prevTransition = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
      pill.style.width = `${activeTab.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prevTransition;
    } else {
      pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
      pill.style.width = `${activeTab.offsetWidth}px`;
    }
  }

  useLayoutEffect(() => {
    movePill(!isFirstPillPaint.current);
    isFirstPillPaint.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  useEffect(() => {
    function handleResize() {
      movePill(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const previousTickers = previousTickersRef.current;
    const addedRow = rows.find((row) => !previousTickers.includes(row.ticker));
    previousTickersRef.current = rows.map((row) => row.ticker);

    if (!addedRow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    setEnteringTicker(addedRow.ticker);
    const timer = window.setTimeout(() => setEnteringTicker(null), 260);
    return () => window.clearTimeout(timer);
  }, [rows]);

  useEffect(() => () => {
    if (equalTimerRef.current !== null) window.clearTimeout(equalTimerRef.current);
  }, []);

  useEffect(() => () => {
    exitTimersRef.current.forEach((id) => window.clearTimeout(id));
  }, []);

  // Removal plays an exit animation before the row actually leaves `rows` — removeAsset fires
  // only after it finishes, so the row stays mounted (and its space held) for the full duration
  // instead of vanishing and snapping the list shut. A Set (not a single ticker) so removing two
  // rows in quick succession lets both animate out independently.
  function handleRemove(ticker: string) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      removeAsset(ticker);
      return;
    }
    setExitingTickers((prev) => new Set(prev).add(ticker));
    const timerId = window.setTimeout(() => {
      removeAsset(ticker);
      setExitingTickers((prev) => {
        const next = new Set(prev);
        next.delete(ticker);
        return next;
      });
      exitTimersRef.current.delete(ticker);
    }, 200);
    exitTimersRef.current.set(ticker, timerId);
  }

  function stopEqualLoading() {
    if (equalTimerRef.current !== null) {
      window.clearTimeout(equalTimerRef.current);
      equalTimerRef.current = null;
    }
    setResettingEqualWeights(true);
    setEqualWeightsLoading(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setResettingEqualWeights(false)));
  }

  // Replays only on an explicit click onto the Equal tab — not on mount, not while already on
  // Equal and adding/removing an asset (rows changing doesn't call selectMethod at all).
  function selectMethod(nextMethod: AllocationMethod) {
    if (nextMethod !== 'equal') {
      if (equalWeightsLoading) stopEqualLoading();
      setMethod(nextMethod);
      return;
    }

    setMethod('equal');
    if (rows.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (equalTimerRef.current !== null) window.clearTimeout(equalTimerRef.current);
    setResettingEqualWeights(true);
    setEqualWeightsLoading(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setResettingEqualWeights(false)));
    equalTimerRef.current = window.setTimeout(() => {
      setEqualWeightsLoading(false);
      equalTimerRef.current = null;
    }, 1000);
  }

  return (
    <div className={s.section}>
      {/* hero */}
      <div className={s.hero}>
        <Donut rows={rows} totalWeight={totalWeight} hovered={hovered} onHover={setHovered} />
        <div className={s.nameGroup}>
          <div className={s.nameRow}>
            <input
              ref={nameInputRef}
              className={s.nameInput}
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              aria-label="Strategy name"
            />
            <button
              type="button"
              className={s.editBtn}
              onClick={() => nameInputRef.current?.focus()}
              aria-label="Edit strategy name"
            >
              <PencilSimple weight="regular" />
            </button>
          </div>
          <input
            className={s.descInput}
            value={description}
            maxLength={60}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Strategy description"
          />
        </div>
      </div>

      {/* allocation header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h2 className={s.title}>Allocation</h2>
          <span className={s.count}>{rows.length} {rows.length === 1 ? 'asset' : 'assets'}</span>
        </div>
        <div className={s.headerRight}>
          <AddAssetPill selected={selected} onToggle={onToggleAsset} />
          <div className={s.methodTabs} role="tablist">
            <span className={s.methodPill} ref={pillRef} aria-hidden="true" />
            {METHODS.map((m) => (
              <button
                type="button"
                role="tab"
                aria-selected={method === m.key}
                key={m.key}
                ref={(el) => { tabRefs.current[m.key] = el; }}
                className={[s.methodTab, method === m.key ? s.methodTabActive : ''].filter(Boolean).join(' ')}
                onClick={() => selectMethod(m.key)}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
          <span className={[s.totalBadge, balanced ? s.totalBalanced : s.totalOff].filter(Boolean).join(' ')}>
            Total: {Math.round(totalWeight)}%
          </span>
        </div>
      </div>

      {/* rows */}
      <div className={s.list}>
        {rows.map((row, i) => (
          <div key={row.ticker} className={s.rowWrap} data-exiting={exitingTickers.has(row.ticker)}>
            <HoldingRow
              row={row}
              color={donutColor(i)}
              dimmed={hovered !== null && hovered !== row.ticker}
              entering={enteringTicker === row.ticker}
              exiting={exitingTickers.has(row.ticker)}
              weightLoading={equalWeightsLoading}
              resettingWeightLoader={resettingEqualWeights}
              onHover={(on) => setHovered(on ? row.ticker : null)}
              onWeight={(w) => setCustomWeight(row.ticker, w)}
              onRemove={() => handleRemove(row.ticker)}
            />
          </div>
        ))}
        {rows.length === 0 && (
          <div className={s.empty}>Use the &quot;Add&quot; button above to start building.</div>
        )}
      </div>
      {equalWeightsLoading && <span className={s.srOnly} role="status">Calculating equal weights</span>}
    </div>
  );
}
