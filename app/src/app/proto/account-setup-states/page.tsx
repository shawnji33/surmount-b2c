'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CompactVariant from './compact';
import NavigatorVariant from './navigator';
import StripVariant from './strip';
import s from './page.module.css';

const VARIANTS = [
  { name: 'Status strip', render: StripVariant },
  { name: 'Navigator', render: NavigatorVariant },
  { name: 'Compact', render: CompactVariant },
];

export default function AccountSetupStatesPrototype() {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const moveHighlight = () => {
    const item = items.current[active];
    if (item && highlight.current) {
      highlight.current.style.width = `${item.offsetWidth}px`;
      highlight.current.style.transform = `translateX(${item.offsetLeft}px)`;
    }
  };

  const selectVariant = (index: number) => {
    if (index < 0 || index >= VARIANTS.length) return;
    setActive(index);
    const url = new URL(window.location.href);
    url.searchParams.set('v', String(index + 1));
    window.history.replaceState(null, '', url);
  };

  useLayoutEffect(moveHighlight, [active]);
  useEffect(() => {
    const selected = Number(new URLSearchParams(window.location.search).get('v') || '1') - 1;
    setActive(Math.max(0, Math.min(VARIANTS.length - 1, selected)));
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    window.addEventListener('resize', moveHighlight);
    return () => window.removeEventListener('resize', moveHighlight);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number(event.key);
      if (number >= 1 && number <= VARIANTS.length) selectVariant(number - 1);
      else if (event.key === 'ArrowRight') selectVariant((active + 1) % VARIANTS.length);
      else if (event.key === 'ArrowLeft') selectVariant((active - 1 + VARIANTS.length) % VARIANTS.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  const Variant = VARIANTS[active].render;
  return (
    <div className={s.prototypeShell}>
      <div key={active} className={s.stage}><Variant /></div>
      <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready || undefined}>
        <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
        {VARIANTS.map((variant, index) => (
          <button key={variant.name} ref={(element) => { items.current[index] = element; }} className="proto-picker-item" data-active={active === index || undefined} aria-current={active === index ? 'true' : undefined} onClick={() => selectVariant(index)}>{variant.name}</button>
        ))}
      </nav>
    </div>
  );
}
