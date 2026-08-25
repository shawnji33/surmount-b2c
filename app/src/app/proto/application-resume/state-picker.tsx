'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const CASES = ['Resume', 'Under review', 'Documents needed'];

export default function ApplicationStatePicker({ initialCase }: { initialCase: number }) {
  const router = useRouter();
  const [active, setActive] = useState(initialCase);
  const [ready, setReady] = useState(false);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const moveHighlight = (index: number) => {
    const item = items.current[index];
    if (!item || !highlight.current) return;
    highlight.current.style.width = `${item.offsetWidth}px`;
    highlight.current.style.transform = `translateX(${item.offsetLeft}px)`;
  };

  const selectCase = (index: number) => {
    if (index < 0 || index >= CASES.length) return;
    setActive(index);
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(index + 1));
    if (index === 1) url.searchParams.set('state', 'submitted');
    else if (index === 2) url.searchParams.set('state', 'documents-needed');
    else url.searchParams.delete('state');
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  };

  useLayoutEffect(() => moveHighlight(active), [active]);

  useEffect(() => {
    setActive(initialCase);
  }, [initialCase]);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    const onResize = () => moveHighlight(active);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
      const keyNumber = Number(event.key);
      if (keyNumber >= 1 && keyNumber <= CASES.length) selectCase(keyNumber - 1);
      else if (event.key === 'ArrowRight') selectCase((active + 1) % CASES.length);
      else if (event.key === 'ArrowLeft') selectCase((active - 1 + CASES.length) % CASES.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  return (
    <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready || undefined}>
      <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
      {CASES.map((label, index) => (
        <button
          type="button"
          key={label}
          ref={(element) => { items.current[index] = element; }}
          className="proto-picker-item"
          data-active={active === index || undefined}
          aria-current={active === index ? 'true' : undefined}
          onClick={() => selectCase(index)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
