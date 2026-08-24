'use client';

import { useRef, useState } from 'react';
import { ArrowsClockwise, ArrowUp, ClockCounterClockwise, DotsThreeVertical } from '@phosphor-icons/react';
import { ChatUserBubble } from '@/components/chat/ChatUserBubble';
import { MatrixLoader } from '@/components/chat/MatrixLoader';
import { TypewriterText } from '@/components/chat/TypewriterText';
import type { ConversationTurn } from '../_lib/usePromptfolioSession';
import type { PromptfolioDraft } from '../_data';
import s from './ChatPanel.module.css';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Ported from the reference ChatComposer's "Section" pattern (label · sub · time, then body,
// with a resolving/blur transition while the next section is still incoming) — re-keyed to this
// session's own revealStage transitions instead of the reference's fictional flavor-data replies.
function Section({ label, sub, body, resolving }: { label: string; sub: string; body: string; resolving?: boolean }) {
  return (
    <div className={[s.section, resolving ? s.sectionResolving : ''].filter(Boolean).join(' ')}>
      <div className={s.sectionMeta}>
        <span className={s.sectionLabel}>{label}</span>
        <span className={s.sectionSub}>{sub}</span>
      </div>
      <p className={s.sectionBody}>{body}</p>
    </div>
  );
}

export function ChatPanel({
  turns,
  isThinking,
  draft,
  revealStage,
  onSubmit,
  onReset,
}: {
  turns: ConversationTurn[];
  isThinking: boolean;
  draft: PromptfolioDraft | null;
  revealStage: number;
  onSubmit: (text: string) => void;
  onReset: () => void;
}) {
  const [reduced] = useState(prefersReducedMotion);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function send() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.headerLabel}>Conversation</span>
        <div className={s.headerActions}>
          <button type="button" aria-label="Start a new conversation" className={s.iconBtn} onClick={onReset}>
            <ArrowsClockwise weight="regular" />
          </button>
          <button type="button" aria-label="History" className={s.iconBtn}>
            <ClockCounterClockwise weight="regular" />
          </button>
          <button type="button" aria-label="More" className={s.iconBtn}>
            <DotsThreeVertical weight="bold" />
          </button>
        </div>
      </div>

      <div className={s.feed} aria-label="Conversation" aria-live="polite">
        {turns.map((turn) =>
          turn.role === 'user' ? (
            <ChatUserBubble key={turn.id}>{turn.text}</ChatUserBubble>
          ) : (
            <article key={turn.id} className={s.assistantMessage}>
              {reduced ? <p>{turn.text}</p> : <p><TypewriterText speed={16} text={turn.text} /></p>}
            </article>
          )
        )}

        {isThinking && (reduced ? <p className={s.thinkingStatic}>Thinking…</p> : <MatrixLoader label="Thinking" />)}

        {draft && revealStage >= 1 && (
          <Section
            label="Strategy"
            sub={draft.name}
            body={draft.description}
            resolving={revealStage === 1}
          />
        )}
        {draft && revealStage >= 2 && (
          <Section
            label="Holdings"
            sub={`${draft.rows.length} positions`}
            body={`Selected ${draft.rows.map((r) => r.ticker).join(', ')}.`}
            resolving={revealStage === 2}
          />
        )}
        {draft && revealStage >= 3 && (
          <Section
            label="Rules"
            sub="Configured"
            body="Rebalancing and risk controls are set — see Custom rules on the right."
            resolving={revealStage === 3}
          />
        )}
      </div>

      <div className={s.composerWrap}>
        <div role="presentation" className={s.composer} onClick={() => inputRef.current?.focus()}>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Prompt or tag a ticker with @"
            aria-label="Chat prompt"
            className={s.input}
          />
          <button type="button" aria-label="Send" disabled={!value.trim()} onClick={send} className={s.sendBtn}>
            <ArrowUp weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
