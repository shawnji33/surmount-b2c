'use client';

import { useMemo, useState } from 'react';
import { STRATEGIES, SEGMENT_COLORS, type Strategy, type Weighted } from '../_data';

export type AllocMode = 'equal' | 'suggested' | 'custom';
export type OverviewBy = 'industry' | 'asset';

export type Segment = Weighted & { color: string };

export function usePortfolioBuilder() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [mode, setMode] = useState<AllocMode>('equal');
  const [customPct, setCustomPct] = useState<Record<string, number>>({});
  const [overviewBy, setOverviewBy] = useState<OverviewBy>('industry');
  const [detailId, setDetailId] = useState<string | null>(null);

  const selected = useMemo(
    () => STRATEGIES.filter(s => selectedIds.includes(s.id)),
    [selectedIds],
  );

  const toggle = (id: string) =>
    setSelectedIds(cur => (cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]));

  const isSelected = (id: string) => selectedIds.includes(id);

  // Weight (%) per selected strategy, derived from the active mode.
  const weights = useMemo<Record<string, number>>(() => {
    const n = selected.length;
    if (n === 0) return {};
    if (mode === 'equal') {
      const w = 100 / n;
      return Object.fromEntries(selected.map(s => [s.id, w]));
    }
    if (mode === 'suggested') {
      const sum = selected.reduce((a, s) => a + s.suggested, 0) || 1;
      return Object.fromEntries(selected.map(s => [s.id, (s.suggested / sum) * 100]));
    }
    // custom — fall back to equal split for any unset entries
    const eq = 100 / n;
    return Object.fromEntries(selected.map(s => [s.id, customPct[s.id] ?? eq]));
  }, [selected, mode, customPct]);

  const totalPct = useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0),
    [weights],
  );

  const dollars = useMemo<Record<string, number>>(
    () => Object.fromEntries(selected.map(s => [s.id, (amount * (weights[s.id] ?? 0)) / 100])),
    [selected, amount, weights],
  );

  const allocated = useMemo(
    () => Object.values(dollars).reduce((a, b) => a + b, 0),
    [dollars],
  );
  const remaining = Math.max(0, amount - allocated);
  const isFullyAllocated = selected.length > 0 && Math.round(totalPct) === 100;

  const setCustomWeight = (id: string, pct: number) => {
    setMode('custom');
    setCustomPct(cur => ({ ...cur, [id]: Math.max(0, Math.min(100, pct)) }));
  };

  // Aggregate the selected strategies' breakdown, weighted by allocation.
  const overview = useMemo<Segment[]>(() => {
    if (selected.length === 0) return [];
    const acc = new Map<string, number>();
    for (const s of selected) {
      const w = (weights[s.id] ?? 0) / 100;
      const rows = overviewBy === 'industry' ? s.industries : s.assets;
      for (const r of rows) acc.set(r.name, (acc.get(r.name) ?? 0) + w * r.pct);
    }
    const total = [...acc.values()].reduce((a, b) => a + b, 0) || 1;
    return [...acc.entries()]
      .map(([name, v]) => ({ name, pct: (v / total) * 100 }))
      .sort((a, b) => b.pct - a.pct)
      .map((row, i) => ({ ...row, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }));
  }, [selected, weights, overviewBy]);

  return {
    all: STRATEGIES as Strategy[],
    selectedIds, selected, toggle, isSelected,
    amount, setAmount,
    mode, setMode,
    weights, dollars, totalPct, allocated, remaining, isFullyAllocated,
    setCustomWeight,
    overviewBy, setOverviewBy, overview,
    detailId,
    detailStrategy: detailId ? STRATEGIES.find(s => s.id === detailId) ?? null : null,
    openDetail: (id: string) => setDetailId(id),
    closeDetail: () => setDetailId(null),
  };
}

export type Builder = ReturnType<typeof usePortfolioBuilder>;
