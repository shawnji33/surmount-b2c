'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Equals, SlidersHorizontal, PencilSimple } from '@phosphor-icons/react';
import { Donut, donutColor } from '@/app/home/builder/_shared/_build/Donut';
import { HoldingRow } from '@/app/home/builder/_shared/_build/HoldingRow';
import type { AllocationMethod, AllocationRow } from '@/app/home/builder/_shared/types';
import { TopOfListAddAsset } from './TopOfListAddAsset';
// Reuses the real production AllocationSection.module.css rather than duplicating its rules — this
// file only forks the *structure* (where the add-asset trigger sits), not the visual language. Read
// import only; that file is never edited.
import s from '@/app/home/builder/_shared/_build/AllocationSection.module.css';

const METHODS: { key: AllocationMethod; label: string; icon: React.ReactNode }[] = [
  { key: 'equal', label: 'Equal', icon: <Equals weight="regular" /> },
  { key: 'custom', label: 'Custom', icon: <SlidersHorizontal weight="regular" /> },
];

// Fork of production AllocationSection (@/app/home/builder/_shared/_build/AllocationSection.tsx)
// for the "top of list" comparison variant. The production header has no slot for hiding
// AddAssetPill or injecting a different trigger into .list, and this run's whole point is testing
// that different placement — so rather than bolt a conditional prop onto the real component
// (which the prototype workflow's hard rule against touching production code forbids anyway),
// this duplicates AllocationSection's hero/header/list shell verbatim and changes exactly one
// thing: AddAssetPill moves out of headerRight and TopOfListAddAsset becomes the first row of
// .list. Every other line — the method-tab pill slide, the equal-weight loading choreography, the
// entering-row animation — is unchanged from production so the comparison isolates the one axis
// under test.
export function TopOfListAllocationSection({
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
  const [equalWeightsLoading, setEqualWeightsLoading] = useState(false);
  const [resettingEqualWeights, setResettingEqualWeights] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Partial<Record<AllocationMethod, HTMLButtonElement | null>>>({});
  const isFirstPillPaint = useRef(true);
  const previousTickersRef = useRef(rows.map((row) => row.ticker));
  const equalTimerRef = useRef<number | null>(null);

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

  function stopEqualLoading() {
    if (equalTimerRef.current !== null) {
      window.clearTimeout(equalTimerRef.current);
      equalTimerRef.current = null;
    }
    setResettingEqualWeights(true);
    setEqualWeightsLoading(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setResettingEqualWeights(false)));
  }

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

      {/* allocation header — no add-asset trigger here; it lives in .list below as the first row */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h2 className={s.title}>Allocation</h2>
          <span className={s.count}>{rows.length} {rows.length === 1 ? 'asset' : 'assets'}</span>
        </div>
        <div className={s.headerRight}>
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

      {/* rows — the add-asset trigger is the first row, pinned above the holdings */}
      <div className={s.list}>
        <TopOfListAddAsset selected={selected} onToggle={onToggleAsset} />
        {rows.map((row, i) => (
          <HoldingRow
            key={row.ticker}
            row={row}
            color={donutColor(i)}
            dimmed={hovered !== null && hovered !== row.ticker}
            entering={enteringTicker === row.ticker}
            weightLoading={equalWeightsLoading}
            resettingWeightLoader={resettingEqualWeights}
            onHover={(on) => setHovered(on ? row.ticker : null)}
            onWeight={(w) => setCustomWeight(row.ticker, w)}
            onRemove={() => removeAsset(row.ticker)}
          />
        ))}
      </div>
      {equalWeightsLoading && <span className={s.srOnly} role="status">Calculating equal weights</span>}
    </div>
  );
}
