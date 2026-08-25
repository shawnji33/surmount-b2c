'use client';

import { useEffect, useRef, useState } from 'react';
import { ASSET_UNIVERSE } from '../../_data';
import { describeInput, extractMentionedTickers, generateStrategyIdentity, matchTemplate, mergeMentionedTickers } from './promptfolioEngine';
import type { PromptfolioDraft } from '../_data';

export type ProcedureKind = 'build' | 'asset-update';

export type ConversationTurn =
  | {
      id: string;
      role: 'user' | 'assistant';
      text: string;
    }
  | {
      id: string;
      role: 'procedure';
      step: number;
      complete: boolean;
      draft: PromptfolioDraft;
      kind: ProcedureKind;
      addedTickers: string[];
    };

function rebalanceRows(rows: PromptfolioDraft['rows'], lockedTicker?: string, lockedWeight?: number) {
  if (rows.length === 0) return rows;
  if (rows.length === 1) return [{ ...rows[0], weight: 100 }];

  const locked = lockedTicker ? rows.find((row) => row.ticker === lockedTicker) : undefined;
  const target = locked
    ? Math.max(0, Math.min(100, Math.round(lockedWeight ?? locked.weight)))
    : 0;
  const flexible = locked ? rows.filter((row) => row.ticker !== locked.ticker) : rows;
  const available = locked ? 100 - target : 100;
  const flexibleTotal = flexible.reduce((sum, row) => sum + row.weight, 0);

  const scaled = flexible.map((row) => ({
    ...row,
    weight: flexibleTotal > 0
      ? Math.round((row.weight / flexibleTotal) * available)
      : Math.floor(available / flexible.length),
  }));
  const correction = available - scaled.reduce((sum, row) => sum + row.weight, 0);
  if (scaled[0]) scaled[0] = { ...scaled[0], weight: scaled[0].weight + correction };

  return rows.map((row) => (
    locked && row.ticker === locked.ticker
      ? { ...row, weight: target }
      : scaled.find((item) => item.ticker === row.ticker) ?? row
  ));
}

const PROCEDURE_STEP_MS = 5000;
const ASSET_UPDATE_STEP_MS = 3000;
const BUILD_STATUS_DELAY_MS = 400;
const BUILD_STATUS_HOLD_MS = 3500;
const ASSET_UPDATE_STATUS_HOLD_MS = 1400;
const ASSET_UPDATE_HIGHLIGHT_MS = 2200;
const DRAFT_START_MS = 200;
const REVEAL_HOLDINGS_MS = 300;
const REVEAL_RULES_STAGGER_MS = 80;
const REVEAL_RULES_BASE_MS = 220;
const REVEAL_CTA_MS = 250;

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Chained-setTimeout choreography, same idiom as home/agents/page.tsx's own scripted
// thinking→reply→reveal sequence — no backend, deterministic per input. revealStage: 0 = nothing
// yet, 1 = name/description, 2 = holdings, 3 = rules, 4 = complete (CTA enabled).
export function usePromptfolioSession(initialInput: string | null, autoStart = true) {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [draft, setDraft] = useState<PromptfolioDraft | null>(null);
  const [revealStage, setRevealStage] = useState(0);
  const [matchedTemplateName, setMatchedTemplateName] = useState<string | null>(null);
  const [recentlyAddedTickers, setRecentlyAddedTickers] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);
  const startedRef = useRef(false);
  const turnCounterRef = useRef(0);

  function nextTurnId() {
    turnCounterRef.current += 1;
    return `turn-${turnCounterRef.current}`;
  }

  function schedule(fn: () => void, delay: number) {
    const id = window.setTimeout(fn, reducedMotion() ? 0 : delay);
    timersRef.current.push(id);
    return id;
  }

  function clearAllTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function submit(input: string) {
    const trimmed = input.trim();
    if (!trimmed) return;

    clearAllTimers();
    setRecentlyAddedTickers([]);
    const isRefreshingCompletedDraft = draft !== null && revealStage >= 4;
    if (!isRefreshingCompletedDraft) setRevealStage(0);
    const procedureId = nextTurnId();
    const userTurnId = nextTurnId();
    setIsThinking(true);

    const matched = matchTemplate(trimmed);
    const mentioned = extractMentionedTickers(trimmed);
    const addedTickers = isRefreshingCompletedDraft && draft
      ? mentioned.filter((ticker) => !draft.rows.some((row) => row.ticker === ticker))
      : [];
    const procedureKind: ProcedureKind = addedTickers.length > 0 ? 'asset-update' : 'build';
    const sourceDraft = procedureKind === 'asset-update' && draft ? draft : matched.draft;
    const mergedDraft = mergeMentionedTickers(
      sourceDraft,
      procedureKind === 'asset-update' ? addedTickers : mentioned,
      procedureKind === 'asset-update' ? 'after' : 'before',
    );
    const addedAssetNames = addedTickers.map((ticker) => (
      ASSET_UNIVERSE.find((asset) => asset.ticker === ticker)?.name ?? ticker
    ));
    const nextDraft = procedureKind === 'asset-update' && draft
      ? {
          ...mergedDraft,
          name: draft.name,
          description: `${draft.description.replace(/\.$/, '')}. Now includes ${addedAssetNames.join(', ')} as a satellite position.`,
        }
      : matched.id === 'generic'
        ? generateStrategyIdentity(trimmed, mergedDraft)
        : mergedDraft;
    const assistantReply = procedureKind === 'asset-update'
      ? `${addedAssetNames.join(', ')} has been added at a 15% target weight. The existing holdings were proportionally rebalanced to keep the portfolio at 100%.`
      : matched.assistantReply;
    if (!isRefreshingCompletedDraft) setDraft(nextDraft);
    setMatchedTemplateName(nextDraft.name);

    // Acknowledge the submission with the user's prompt first. The live build status follows
    // 400ms later, then gets its own short beat before the first procedure row is revealed.
    setTurns((prev) => [
      ...prev,
      { id: userTurnId, role: 'user', text: describeInput(trimmed) },
    ]);

    function updateProcedure(step: number, complete = false) {
      setTurns((prev) => prev.map((turn) => (
        turn.role === 'procedure' && turn.id === procedureId
          ? { ...turn, step, complete }
          : turn
      )));
    }

    function finishProcedure() {
      updateProcedure(4, true);
      setIsThinking(false);
      const assistantTurnId = nextTurnId();
      setTurns((prev) => [...prev, { id: assistantTurnId, role: 'assistant', text: assistantReply }]);

      if (isRefreshingCompletedDraft) {
        setDraft(nextDraft);
        setRevealStage(4);
        if (addedTickers.length > 0) {
          setRecentlyAddedTickers(addedTickers);
          schedule(() => setRecentlyAddedTickers([]), ASSET_UPDATE_HIGHLIGHT_MS);
        }
        return;
      }

      schedule(() => {
        setRevealStage(1);

        schedule(() => {
          setRevealStage(2);

          const rulesDelay = REVEAL_RULES_BASE_MS + nextDraft.rows.length * REVEAL_RULES_STAGGER_MS;
          schedule(() => {
            setRevealStage(3);

            schedule(() => {
              setRevealStage(4);
            }, REVEAL_CTA_MS);
          }, rulesDelay);
        }, REVEAL_HOLDINGS_MS);
      }, DRAFT_START_MS);
    }

    function advance(step: number) {
      if (step > 4) {
        finishProcedure();
        return;
      }
      schedule(() => {
        updateProcedure(step);
        advance(step + 1);
      }, procedureKind === 'asset-update' ? ASSET_UPDATE_STEP_MS : PROCEDURE_STEP_MS);
    }

    schedule(() => {
      setTurns((prev) => [
        ...prev,
        {
          id: procedureId,
          role: 'procedure',
          step: -1,
          complete: false,
          draft: nextDraft,
          kind: procedureKind,
          addedTickers,
        },
      ]);

      schedule(() => {
        updateProcedure(0);
        advance(1);
      }, procedureKind === 'asset-update' ? ASSET_UPDATE_STATUS_HOLD_MS : BUILD_STATUS_HOLD_MS);
    }, BUILD_STATUS_DELAY_MS);
  }

  function reset() {
    clearAllTimers();
    setTurns([]);
    setIsThinking(false);
    setDraft(null);
    setRevealStage(0);
    setMatchedTemplateName(null);
    setRecentlyAddedTickers([]);
  }

  function updateRules(updater: (current: PromptfolioDraft['rules']) => PromptfolioDraft['rules']) {
    setDraft((current) => (current ? { ...current, rules: updater(current.rules) } : current));
  }

  function addHolding(ticker: string) {
    setDraft((current) => {
      if (!current || current.rows.some((row) => row.ticker === ticker)) return current;
      const initialWeight = current.rows.length === 0 ? 100 : Math.min(10, Math.floor(100 / (current.rows.length + 1)));
      const rows = [...current.rows, { ticker, weight: initialWeight }];
      return { ...current, rows: rebalanceRows(rows, ticker, initialWeight) };
    });
  }

  function updateHoldingWeight(ticker: string, weight: number) {
    setDraft((current) => (current
      ? { ...current, rows: rebalanceRows(current.rows, ticker, weight) }
      : current));
  }

  // Lets the holdings table edit the current draft without re-running the scripted procedure.
  function removeHolding(ticker: string) {
    setDraft((current) => {
      if (!current) return current;
      return { ...current, rows: rebalanceRows(current.rows.filter((row) => row.ticker !== ticker)) };
    });
  }

  function restoreHolding(ticker: string, weight: number, index: number) {
    setDraft((current) => {
      if (!current || current.rows.some((row) => row.ticker === ticker)) return current;
      const rows = [...current.rows];
      rows.splice(Math.min(Math.max(index, 0), rows.length), 0, { ticker, weight });
      return { ...current, rows: rebalanceRows(rows, ticker, weight) };
    });
  }

  // Kick off from the initial landing-screen submission exactly once.
  useEffect(() => {
    if (startedRef.current || !autoStart) return;
    startedRef.current = true;
    if (initialInput) submit(initialInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, initialInput]);

  useEffect(() => () => clearAllTimers(), []);

  return {
    turns,
    isThinking,
    draft,
    revealStage,
    matchedTemplateName,
    recentlyAddedTickers,
    submit,
    reset,
    updateRules,
    addHolding,
    updateHoldingWeight,
    removeHolding,
    restoreHolding,
  };
}
