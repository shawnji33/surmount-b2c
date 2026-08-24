'use client';

import { useRef } from 'react';
import { PromptComposer, type PromptComposerHandle } from './PromptComposer';
import { ExamplePrompts } from './ExamplePrompts';
import s from './PromptfolioHero.module.css';

export function PromptfolioHero({ onSubmit }: { onSubmit: (input: string) => void }) {
  const composerRef = useRef<PromptComposerHandle>(null);

  return (
    <div className={s.root}>
      <div className="dot-grid-panel" aria-hidden="true" />

      <div className={s.content}>
        <div className={s.titleRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/badges/ai-badge.svg" alt="" className={s.badge} />
          <h1 className={s.headline}>Hi, how can I help you build your portfolio</h1>
        </div>

        <PromptComposer ref={composerRef} size="hero" onSubmit={onSubmit} />

        <ExamplePrompts onPick={(text) => composerRef.current?.fillPrompt(text)} />
      </div>
    </div>
  );
}
