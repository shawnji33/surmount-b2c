'use client';

import { useEffect, useRef, useState, type TransitionEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PromptfolioHero } from './_components/PromptfolioHero';
import { BuildingView } from './_components/BuildingView';
import { SummaryView } from './_components/SummaryView';
import { clearPromptfolioReview, readPromptfolioReview, savePromptfolioReview } from './_lib/promptfolioReviewStorage';
import type { PromptfolioDraft } from './_data';
import s from './PromptfolioBuilder.module.css';

type Stage = 'landing' | 'building' | 'summary';
type Submission = { id: number; input: string };

// Landing and building are both full-page layouts (not one panel expanding into another), so the
// Surmount "keep containers mounted, animate" pattern here is a grid-stack crossfade — same
// occlusion technique as BacktestPanel's skeleton-to-content reveal, just at page scope — rather
// than a height/grid-rows collapse, which only reads correctly for a single element resizing.
//
// Stage is mirrored into a `?stage=building` query param (replace, not push, so every submit
// doesn't pile up history entries) purely so HomeShell — which only sees the pathname, not this
// component's own state — knows when to bring the sidebar + real builder chrome back for the
// building stage while landing stays the full-bleed immersive hero.
export function PromptfolioBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageParam = searchParams.get('stage');
  const stage: Stage = stageParam === 'building' || stageParam === 'summary' ? stageParam : 'landing';
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviewDraft, setReviewDraft] = useState<PromptfolioDraft | null>(null);
  const [builderReady, setBuilderReady] = useState(false);
  const submissionIdRef = useRef(0);

  useEffect(() => {
    if (stage !== 'building' || !submission) {
      setBuilderReady(false);
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBuilderReady(true);
      return undefined;
    }

    // Transition events are the source of truth; this only covers browsers that suppress one.
    const fallback = window.setTimeout(() => setBuilderReady(true), 420);
    return () => window.clearTimeout(fallback);
  }, [stage, submission]);

  useEffect(() => {
    if (stage !== 'summary' || reviewDraft) return;
    const storedDraft = readPromptfolioReview();
    if (storedDraft) {
      setReviewDraft(storedDraft);
      return;
    }
    router.replace('/home/builder/promptfolio');
  }, [reviewDraft, router, stage]);

  function handleSubmit(input: string) {
    submissionIdRef.current += 1;
    setBuilderReady(false);
    setSubmission({ id: submissionIdRef.current, input });
    setReviewDraft(null);
    clearPromptfolioReview();
    router.replace('/home/builder/promptfolio?stage=building');
  }

  function handleBack() {
    setBuilderReady(false);
    router.replace('/home/builder/promptfolio');
  }

  function handleReview(draft: PromptfolioDraft) {
    setReviewDraft(draft);
    savePromptfolioReview(draft);
    router.replace('/home/builder/promptfolio?stage=summary');
  }

  function handleSummaryBack() {
    router.replace('/home/builder/promptfolio?stage=building');
  }

  function handleBuildingTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== 'opacity') return;
    if (stage === 'building' && submission) setBuilderReady(true);
  }

  return (
    <div className={s.stageStack}>
      <div className={s.layer} data-hidden={stage !== 'landing'} inert={stage !== 'landing'}>
        <PromptfolioHero onSubmit={handleSubmit} />
      </div>

      {/* Building's real content (backtest chart + stats + holdings table) is taller than a
       * viewport and grows with the draft — unlike landing's fixed 100vh hero. Left in normal
       * flow while hidden, it would inflate the shared grid-stack cell (and landing's own
       * scrollable height) to match its full height even though it's invisible. .buildingLayer
       * takes it out of flow via position:absolute whenever it's the hidden one. */}
      <div
        className={[s.layer, s.buildingLayer].join(' ')}
        data-hidden={stage !== 'building'}
        inert={stage !== 'building'}
        onTransitionEnd={handleBuildingTransitionEnd}
      >
        {/* Keyed by the submitted text so starting a new conversation from "Back" gets a fresh
         * session — the .layer wrapper itself (which owns the crossfade transition) stays mounted
         * throughout, only this inner component remounts. */}
        <BuildingView
          key={submission?.id ?? 'none'}
          initialInput={submission?.input ?? null}
          startSession={builderReady}
          onBack={handleBack}
          onReview={handleReview}
        />
      </div>

      <div className={[s.layer, s.summaryLayer].join(' ')} data-hidden={stage !== 'summary'} inert={stage !== 'summary'}>
        {reviewDraft && <SummaryView draft={reviewDraft} onBack={handleSummaryBack} />}
      </div>
    </div>
  );
}
