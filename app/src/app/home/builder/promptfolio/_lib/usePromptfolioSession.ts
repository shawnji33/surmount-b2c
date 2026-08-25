'use client';

import { useEffect, useRef, useState } from 'react';
import { describeInput, extractMentionedTickers, generateStrategyIdentity, matchTemplate, mergeMentionedTickers } from './promptfolioEngine';
import type { PromptfolioDraft } from '../_data';

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
const BUILD_STATUS_HOLD_MS = 3500;
const DRAFT_START_MS = 200;
const REVEAL_HOLDINGS_MS = 300;
const REVEAL_RULES_STAGGER_MS = 80;
const REVEAL_RULES_BASE_MS = 220;
const REVEAL_CTA_MS = 250;

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let turnCounter = 0;
function nextTurnId() {
  turnCounter += 1;
  return `turn-${turnCounter}`;
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
  const timersRef = useRef<number[]>([]);
  const startedRef = useRef(false);

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
    setRevealStage(0);
    const procedureId = nextTurnId();
    setIsThinking(true);

    const matched = matchTemplate(trimmed);
    const mentioned = extractMentionedTickers(trimmed);
    const mergedDraft = mergeMentionedTickers(matched.draft, mentioned);
    const draft = matched.id === 'generic'
      ? generateStrategyIdentity(trimmed, mergedDraft)
      : mergedDraft;
    setDraft(draft);
    setMatchedTemplateName(matched.draft.name);

    // Acknowledge the submission immediately with both the user's prompt and the live build
    // status. The status then gets its own short beat before the first procedure row is revealed.
    setTurns((prev) => [
      ...prev,
      { id: nextTurnId(), role: 'user', text: describeInput(trimmed) },
      { id: procedureId, role: 'procedure', step: -1, complete: false, draft },
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
      setTurns((prev) => [...prev, { id: nextTurnId(), role: 'assistant', text: matched.assistantReply }]);

      schedule(() => {
        setRevealStage(1);

        schedule(() => {
          setRevealStage(2);

          const rulesDelay = REVEAL_RULES_BASE_MS + draft.rows.length * REVEAL_RULES_STAGGER_MS;
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
      }, PROCEDURE_STEP_MS);
    }

    schedule(() => {
      updateProcedure(0);
      advance(1);
    }, BUILD_STATUS_HOLD_MS);
  }

  function reset() {
    clearAllTimers();
    setTurns([]);
    setIsThinking(false);
    setDraft(null);
    setRevealStage(0);
    setMatchedTemplateName(null);
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
    submit,
    reset,
    updateRules,
    addHolding,
    updateHoldingWeight,
    removeHolding,
    restoreHolding,
  };
}
