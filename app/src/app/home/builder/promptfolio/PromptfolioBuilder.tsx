'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PromptfolioHero } from './_components/PromptfolioHero';
import { BuildingView } from './_components/BuildingView';
import s from './PromptfolioBuilder.module.css';

type Stage = 'landing' | 'building';

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
  const stage: Stage = searchParams.get('stage') === 'building' ? 'building' : 'landing';
  const [submittedInput, setSubmittedInput] = useState<string | null>(null);

  function handleSubmit(input: string) {
    setSubmittedInput(input);
    router.replace('/home/builder/promptfolio?stage=building');
  }

  function handleBack() {
    router.replace('/home/builder/promptfolio');
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
      <div className={[s.layer, s.buildingLayer].join(' ')} data-hidden={stage !== 'building'} inert={stage !== 'building'}>
        {/* Keyed by the submitted text so starting a new conversation from "Back" gets a fresh
         * session — the .layer wrapper itself (which owns the crossfade transition) stays mounted
         * throughout, only this inner component remounts. */}
        <BuildingView key={submittedInput ?? 'none'} initialInput={submittedInput} onBack={handleBack} />
      </div>
    </div>
  );
}
