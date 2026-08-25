'use client';

import { useState } from 'react';
import { ChatUserBubble } from '@/components/chat/ChatUserBubble';
import { TypewriterText } from '@/components/chat/TypewriterText';
import type { ConversationTurn } from '../_lib/usePromptfolioSession';
import { PromptComposer } from './PromptComposer';
import { ThinkingProcedure } from './ThinkingProcedure';
import s from './ConversationPanel.module.css';

// TypewriterText/MatrixLoader have no built-in reduced-motion handling (confirmed by reading both
// components) — checked once per mount here, matching the codebase's existing inline
// matchMedia-at-call-site convention (see AllocationSection.tsx/PickStocksStep.tsx) rather than a
// new shared hook.
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ConversationPanel({
  turns,
  isThinking,
  onSubmit,
}: {
  turns: ConversationTurn[];
  isThinking: boolean;
  onSubmit: (text: string) => void;
}) {
  const [reduced] = useState(prefersReducedMotion);

  return (
    <div className={s.root}>
      <div className={s.feed} aria-label="Conversation" aria-live="polite" aria-busy={isThinking}>
        {turns.map((turn) => {
          if (turn.role === 'user') {
            return (
              <ChatUserBubble key={turn.id} variant="compact">{turn.text}</ChatUserBubble>
            );
          }
          if (turn.role === 'procedure') {
            return <ThinkingProcedure key={turn.id} step={turn.step} complete={turn.complete} draft={turn.draft} />;
          }
          return (
            <article key={turn.id} className={s.assistantMessage}>
              {reduced ? <p>{turn.text}</p> : <p><TypewriterText speed={16} text={turn.text} /></p>}
            </article>
          );
        })}
      </div>

      <div className={s.composerFooter}>
        <PromptComposer size="compact" placeholder="Refine your agent…" onSubmit={onSubmit} />
      </div>
    </div>
  );
}
