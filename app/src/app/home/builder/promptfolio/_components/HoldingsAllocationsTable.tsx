'use client';

import { useEffect, useRef, useState } from 'react';
import { TrashSimple } from '@phosphor-icons/react';
import { ASSET_UNIVERSE } from '../../_data';
import type { AllocationRow } from '../../_shared/types';
import s from './HoldingsAllocationsTable.module.css';

const MARKET_CAP_LABEL: Record<string, string> = {
  large: 'Large-cap',
  mid: 'Mid-cap',
  small: 'Small-cap',
};

const RELEVANCE_BARS = 8;

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

function WeightInput({
  ticker,
  weight,
  onCommit,
  onCancel,
}: {
  ticker: string;
  weight: number;
  onCommit: (weight: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(String(weight));
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => setValue(String(weight)), [weight]);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function commit() {
    if (finishedRef.current) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      finishedRef.current = true;
      onCancel();
      return;
    }
    finishedRef.current = true;
    onCommit(Math.max(0, Math.min(100, parsed)));
  }

  return (
    <form
      className={s.weightEditor}
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
    >
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={100}
        step={1}
        inputMode="decimal"
        value={value}
        aria-label={`${ticker} target weight`}
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            finishedRef.current = true;
            onCancel();
          }
        }}
      />
      <span aria-hidden="true">%</span>
    </form>
  );
}

export function HoldingsAllocationsTable({
  rows,
  templateName,
  editable = false,
  weightEditable = false,
  onAdd,
  onWeightChange,
  onRemove,
}: {
  rows: AllocationRow[];
  templateName: string | null;
  editable?: boolean;
  weightEditable?: boolean;
  onAdd: (ticker: string) => void;
  onWeightChange: (ticker: string, weight: number) => void;
  onRemove: (ticker: string) => void;
}) {
  const [selectedTicker, setSelectedTicker] = useState('');
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [weightAnnouncement, setWeightAnnouncement] = useState('');
  const sorted = rows;
  const canEditWeights = editable || weightEditable;
  const maxWeight = Math.max(...rows.map((r) => r.weight), 1);
  const availableAssets = ASSET_UNIVERSE.filter((asset) => !rows.some((row) => row.ticker === asset.ticker));

  useEffect(() => {
    if (selectedTicker && !availableAssets.some((asset) => asset.ticker === selectedTicker)) setSelectedTicker('');
  }, [availableAssets, selectedTicker]);

  useEffect(() => {
    if (editingTicker && !rows.some((row) => row.ticker === editingTicker)) setEditingTicker(null);
  }, [editingTicker, rows]);

  return (
    <div
      className={s.card}
      data-editable={editable}
      data-weight-editable={canEditWeights}
      aria-label="All holdings and allocations"
    >
      <span className={s.srOnly} aria-live="polite">{weightAnnouncement}</span>
      {editable && (
        <div className={s.toolbar}>
          <span className={s.toolbarTitle}>Customize holdings</span>
          <div className={s.addHolding}>
            <select value={selectedTicker} aria-label="Choose a holding to add" onChange={(event) => setSelectedTicker(event.target.value)}>
              <option value="">Choose an asset</option>
              {availableAssets.map((asset) => (
                <option key={asset.ticker} value={asset.ticker}>{asset.ticker} — {asset.name}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedTicker}
              onClick={() => {
                if (!selectedTicker) return;
                onAdd(selectedTicker);
                setSelectedTicker('');
              }}
            >
              Add holding
            </button>
          </div>
          <span className={s.totalWeight}>{rows.reduce((sum, row) => sum + row.weight, 0)}% allocated</span>
        </div>
      )}

      <div className={s.headerRow}>
        <span>Asset</span>
        <span>Market Cap</span>
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
            <div
              className={s.row}
              key={row.ticker}
              data-weight-editable={canEditWeights}
              data-selection-context={`${row.ticker} holding`}
              data-selection-text={`${row.ticker} ${row.weight}%`}
            >
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

              {canEditWeights && editingTicker === row.ticker ? (
                <WeightInput
                  ticker={row.ticker}
                  weight={row.weight}
                  onCancel={() => setEditingTicker(null)}
                  onCommit={(weight) => {
                    onWeightChange(row.ticker, weight);
                    setWeightAnnouncement(`${row.ticker} changed to ${Math.round(weight)}%. Remaining holdings rebalanced to 100%.`);
                    setEditingTicker(null);
                  }}
                />
              ) : canEditWeights ? (
                <button
                  type="button"
                  className={s.weightButton}
                  aria-label={`Edit ${row.ticker} target weight, currently ${row.weight}%`}
                  onClick={() => setEditingTicker(row.ticker)}
                >
                  <span>{row.weight}</span><span aria-hidden="true">%</span>
                </button>
              ) : (
                <span className={s.cell}>{row.weight}%</span>
              )}

              <span className={[s.cell, s.reason].join(' ')}>{reasonFor(i, templateName)}</span>

              <button
                type="button"
                className={s.deleteBtn}
                aria-label={rows.length === 1 ? `${row.ticker} is the last holding` : `Remove ${row.ticker}`}
                disabled={rows.length === 1}
                onClick={() => onRemove(row.ticker)}
              >
                <TrashSimple weight="regular" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
