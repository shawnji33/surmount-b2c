'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { ChatUserBubble } from '@/components/chat/ChatUserBubble';
import { TypewriterText } from '@/components/chat/TypewriterText';
import type { ConversationTurn } from '../_lib/usePromptfolioSession';
import type { PromptfolioDraft } from '../_data';
import { PortfolioSummaryCard } from './PortfolioSummaryCard';
import { PromptComposer, type PromptComposerAnnotation } from './PromptComposer';
import { ThinkingProcedure } from './ThinkingProcedure';
import s from './ChatPanel.module.css';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ChatPanel({
  turns,
  isThinking,
  draft,
  revealStage,
  onSubmit,
  onReset,
  promptAnnotations,
  onRemovePromptAnnotation,
}: {
  turns: ConversationTurn[];
  isThinking: boolean;
  draft: PromptfolioDraft | null;
  revealStage: number;
  onSubmit: (text: string) => void;
  onReset: () => void;
  promptAnnotations?: PromptComposerAnnotation[];
  onRemovePromptAnnotation?: (id: number) => void;
}) {
  const [reduced] = useState(prefersReducedMotion);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollTop = feed.scrollHeight;
  }, [turns, revealStage]);

  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.headerLabel}>Conversation</span>
        <div className={s.headerActions}>
          <button type="button" aria-label="Start a new conversation" className={s.iconBtn} onClick={onReset}>
            <ArrowsClockwise weight="regular" />
          </button>
        </div>
      </div>

      <div ref={feedRef} className={s.feed} aria-label="Conversation" aria-live="polite" aria-busy={isThinking}>
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

        {draft && revealStage >= 1 && (
          <PortfolioSummaryCard
            draft={draft}
            revealStage={revealStage}
          />
        )}
      </div>

      <div className={s.composerWrap}>
        <PromptComposer
          size="panel"
          placeholder="Write a message…"
          annotations={promptAnnotations}
          onRemoveAnnotation={onRemovePromptAnnotation}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
