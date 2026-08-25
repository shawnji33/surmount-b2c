'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clearPendingDraft, peekPendingDraft } from './_lib/promptfolioHandoff';
import type { AllocationMethod, AllocationRow, BacktestRangeTab, BacktestResult, BacktestStatus, RuleState } from './types';

const DEFAULT_SELECTED: string[] = [];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function computeRows(selected: string[], method: AllocationMethod, customWeights: Record<string, number>): AllocationRow[] {
  if (selected.length === 0) return [];

  if (method === 'equal') {
    const base = Math.floor((100 / selected.length) * 100) / 100;
    const remainder = round2(100 - base * selected.length);
    return selected.map((ticker, i) => ({ ticker, weight: i === 0 ? round2(base + remainder) : base }));
  }

  const evenFallback = round2(100 / selected.length);
  return selected.map((ticker) => ({ ticker, weight: customWeights[ticker] ?? evenFallback }));
}

export function useStrategyBuilderState() {
  // A Promptfolio draft handed off via sessionStorage (see promptfolioHandoff.ts) seeds the
  // initial state below when present. peekPendingDraft() only reads (never mutates), so it's safe
  // to call on every render — including React StrictMode's double-invoked dev render — and the
  // actual one-time consumption happens in the mount effect further down.
  const pendingDraft = peekPendingDraft();

  const [name, setName] = useState(() => pendingDraft?.name ?? 'Strategy name');
  const [description, setDescription] = useState(() => pendingDraft?.description ?? 'A brief description of this strategy');
  const [selected, setSelected] = useState<string[]>(() => (pendingDraft ? pendingDraft.rows.map((r) => r.ticker) : DEFAULT_SELECTED));
  const [method, setMethod] = useState<AllocationMethod>(() => (pendingDraft ? 'custom' : 'equal'));
  const [customWeights, setCustomWeights] = useState<Record<string, number>>(() =>
    pendingDraft ? Object.fromEntries(pendingDraft.rows.map((r) => [r.ticker, r.weight])) : {}
  );
  const [rules, setRules] = useState<RuleState>(
    () =>
      pendingDraft?.rules ?? {
        rebalance: { enabled: true, every: 30, unit: 'Days' },
        stopLoss: { enabled: true, percent: 30 },
        takeProfit: { enabled: false, percent: 50 },
      }
  );

  useEffect(() => {
    clearPendingDraft();
  }, []);

  // Lifted out of BacktestPanel so the last-run backtest survives switching away from the
  // Backtest tab and back — BuilderWorkspace only mounts the active tab's panel, so state that
  // lived inside BacktestPanel itself would reset to idle every time you left and returned.
  const [backtestStartDate, setBacktestStartDate] = useState<Date | null>(null);
  const [backtestEndDate, setBacktestEndDate] = useState<Date | null>(null);
  const [backtestAmount, setBacktestAmount] = useState('$100,000.00');
  const [backtestSlippage, setBacktestSlippage] = useState('');
  const [backtestStatus, setBacktestStatus] = useState<BacktestStatus>('idle');
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestRangeTab, setBacktestRangeTab] = useState<BacktestRangeTab>('1Y');

  // Save button stays disabled until something actually changes since the last save (or since
  // mount, for a never-saved strategy). Backtest config/results deliberately aren't watched here
  // — running a backtest isn't a change to the strategy itself, just a tool applied to it.
  const [isDirty, setIsDirty] = useState(false);
  const skipNextDirtyCheck = useRef(true);

  useEffect(() => {
    if (skipNextDirtyCheck.current) {
      skipNextDirtyCheck.current = false;
      return;
    }
    setIsDirty(true);
  }, [name, description, selected, method, customWeights, rules]);

  function markSaved() {
    setIsDirty(false);
  }

  function toggleAsset(ticker: string) {
    setSelected((prev) => (prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]));
  }

  function removeAsset(ticker: string) {
    setSelected((prev) => prev.filter((t) => t !== ticker));
    setCustomWeights((prev) => {
      const next = { ...prev };
      delete next[ticker];
      return next;
    });
  }

  function setCustomWeight(ticker: string, weight: number) {
    setMethod('custom');
    setCustomWeights((prev) => ({ ...prev, [ticker]: weight }));
  }

  function fixAllocation() {
    if (selected.length === 0) return;
    const base = Math.floor((100 / selected.length) * 100) / 100;
    const remainder = round2(100 - base * selected.length);
    const next: Record<string, number> = {};
    selected.forEach((ticker, i) => { next[ticker] = i === 0 ? round2(base + remainder) : base; });
    setCustomWeights(next);
    setMethod('custom');
  }

  const rows = useMemo(() => computeRows(selected, method, customWeights), [selected, method, customWeights]);
  const totalWeight = useMemo(() => round2(rows.reduce((sum, r) => sum + r.weight, 0)), [rows]);

  return {
    name, setName,
    description, setDescription,
    selected, toggleAsset, removeAsset,
    method, setMethod,
    rows, totalWeight,
    setCustomWeight, fixAllocation,
    rules, setRules,
    isDirty, markSaved,
    backtestStartDate, setBacktestStartDate,
    backtestEndDate, setBacktestEndDate,
    backtestAmount, setBacktestAmount,
    backtestSlippage, setBacktestSlippage,
    backtestStatus, setBacktestStatus,
    backtestResult, setBacktestResult,
    backtestRangeTab, setBacktestRangeTab,
  };
}

export type StrategyBuilderState = ReturnType<typeof useStrategyBuilderState>;
