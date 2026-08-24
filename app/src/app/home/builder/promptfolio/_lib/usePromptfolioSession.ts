'use client';

import { useEffect, useRef, useState } from 'react';
import { describeInput, extractMentionedTickers, matchTemplate, mergeMentionedTickers } from './promptfolioEngine';
import type { PromptfolioDraft } from '../_data';

export type ConversationTurn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const THINKING_MS = 1200;
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
export function usePromptfolioSession(initialInput: string | null) {
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
    setDraft(null);

    setTurns((prev) => [...prev, { id: nextTurnId(), role: 'user', text: describeInput(trimmed) }]);
    setIsThinking(true);

    const matched = matchTemplate(trimmed);
    const mentioned = extractMentionedTickers(trimmed);
    const draft = mergeMentionedTickers(matched.draft, mentioned);
    setMatchedTemplateName(matched.draft.name);

    schedule(() => {
      setIsThinking(false);
      setTurns((prev) => [...prev, { id: nextTurnId(), role: 'assistant', text: matched.assistantReply }]);

      schedule(() => {
        setDraft(draft);
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
    }, THINKING_MS);
  }

  function reset() {
    clearAllTimers();
    setTurns([]);
    setIsThinking(false);
    setDraft(null);
    setRevealStage(0);
    setMatchedTemplateName(null);
  }

  // Lets the holdings table's delete action drop a position without waiting on the scripted
  // reveal chain — a direct, real edit to the current draft rather than a re-run of matchTemplate.
  function removeHolding(ticker: string) {
    setDraft((current) => (current ? { ...current, rows: current.rows.filter((r) => r.ticker !== ticker) } : current));
  }

  // Kick off from the initial landing-screen submission exactly once.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (initialInput) submit(initialInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearAllTimers(), []);

  return { turns, isThinking, draft, revealStage, matchedTemplateName, submit, reset, removeHolding };
}
