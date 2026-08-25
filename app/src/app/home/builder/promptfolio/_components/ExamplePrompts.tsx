'use client';

import { useEffect, useRef, useState } from 'react';
import { PROMPT_CATEGORIES } from '../_data';
import s from './ExamplePrompts.module.css';

type Phase = 'entering' | 'idle' | 'exiting';

// Ported from designs/create/promptfolio.html's prompt-suggestions card — same categories, copy,
// and directional stagger timings (exit-then-swap-then-enter, always upward). Labeled "example"
// rather than "recommended" — this app can't imply it's recommending anything (compliance).
// Picking a prompt fills the composer above (via its imperative handle) without submitting,
// matching the source's own fillPrompt().
export function ExamplePrompts({ onPick }: { onPick: (text: string) => void }) {
  const [activeCat, setActiveCat] = useState(PROMPT_CATEGORIES[0].id);
  const [renderedCat, setRenderedCat] = useState(PROMPT_CATEGORIES[0].id);
  const [phase, setPhase] = useState<Phase>('entering');
  const [atStart, setAtStart] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const category = PROMPT_CATEGORIES.find((c) => c.id === renderedCat) ?? PROMPT_CATEGORIES[0];

  function handleSelectCat(id: string) {
    if (id === activeCat) return;
    setActiveCat(id);
    setPhase('exiting');
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    const exitDuration = category.prompts.length * 20 + 130;
    switchTimerRef.current = setTimeout(() => {
      setRenderedCat(id);
      setPhase('entering');
    }, exitDuration);
  }

  // Drop back to 'idle' once the entrance stagger has finished, so a later exit doesn't fight a
  // still-running entrance animation.
  useEffect(() => {
    if (phase !== 'entering') return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setPhase('idle'), category.prompts.length * 42 + 220);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, renderedCat]);

  useEffect(
    () => () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    []
  );

  // Scroll-based edge fades on the tabs row.
  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    function update() {
      const el = tabs;
      if (!el) return;
      const start = el.scrollLeft <= 4;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setAtStart(start);
      setScrolled(!start);
      setAtEnd(end);
    }
    update();
    tabs.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      tabs.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.label}>Try example prompts</span>
      </div>

      <div className={[s.tabsWrap, atStart ? s.atStart : '', scrolled ? s.scrolled : '', atEnd ? s.atEnd : ''].filter(Boolean).join(' ')}>
        <div ref={tabsRef} className={s.tabs}>
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={[s.tab, cat.id === activeCat ? s.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleSelectCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.list}>
        {category.prompts.map((text, i) => (
          <button
            key={`${category.id}-${i}`}
            type="button"
            className={[s.item, phase === 'entering' ? s.entering : '', phase === 'exiting' ? s.exiting : ''].filter(Boolean).join(' ')}
            style={{ animationDelay: `${i * (phase === 'exiting' ? 20 : 42)}ms` }}
            onClick={() => onPick(text)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
