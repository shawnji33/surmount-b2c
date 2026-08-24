'use client';

import { useRef, useState } from 'react';
import { ArrowUp, Compass } from '@phosphor-icons/react';
import s from './AgentPromptInput.module.css';

// Shared chat/prompt input, reused unmodified across all 4 layout explorations — the spec
// treats "chat input as the dominant element" as a constant, not something to vary, so its own
// visual treatment (card, focus glow, send button, guided nudge) stays identical everywhere;
// only its size and position in the surrounding layout differ per variant.
//
// The guided-path nudge below the input is deliberately *not* a link to another screen —
// clicking it seeds the same textarea with a guided-conversation starter and focuses it, so it
// reads as continuing the same chat rather than branching into a separate flow.

const GUIDED_STARTER = "I'm not sure what to automate yet — help me figure it out.";

export function AgentPromptInput({
  size = 'hero',
  placeholder = 'What do you want your agent to do?',
  showNudge = true,
  className,
}: {
  size?: 'hero' | 'compact';
  placeholder?: string;
  showNudge?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const startGuided = () => {
    setValue(GUIDED_STARTER);
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    requestAnimationFrame(() => autoGrow(el));
  };

  return (
    <div className={[s.stack, size === 'compact' ? s.stackCompact : '', className].filter(Boolean).join(' ')}>
      <form
        className={[s.wrap, size === 'compact' ? s.wrapCompact : ''].filter(Boolean).join(' ')}
        onSubmit={(e) => {
          e.preventDefault();
          setValue('');
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }}
      >
        <label className={s.inputUpper}>
          <span className={s.srOnly}>What do you want your agent to do?</span>
          <textarea
            ref={textareaRef}
            className={s.input}
            placeholder={placeholder}
            rows={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              autoGrow(e.target);
            }}
          />
        </label>
        <div className={s.inputLower}>
          <button type="submit" className={s.sendBtn} aria-label="Create agent from prompt">
            <ArrowUp weight="bold" />
          </button>
        </div>
      </form>

      {showNudge && (
        <button type="button" className={s.nudge} onClick={startGuided}>
          <Compass weight="regular" aria-hidden="true" />
          Not sure where to start? Let&rsquo;s build one together.
        </button>
      )}
    </div>
  );
}
