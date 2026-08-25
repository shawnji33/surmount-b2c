'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HomeShell } from '@/app/home/HomeShell';
import TimelineVariant from './timeline';
import CommandCenterVariant from './command-center';
import LedgerVariant from './ledger';
import s from './page.module.css';

const VARIANTS = [
  { name: 'Timeline', render: TimelineVariant },
  { name: 'Command center', render: CommandCenterVariant },
  { name: 'Status ledger', render: LedgerVariant },
];

export default function ApplicationProgressPrototype() {
  const [active, setActive] = useState(0);
  const [remount, setRemount] = useState(0);
  const [ready, setReady] = useState(false);
  const picker = useRef<HTMLElement>(null);
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
    const fromUrl = Math.max(0, Math.min(VARIANTS.length - 1, Number(new URLSearchParams(window.location.search).get('v') || '1') - 1));
    setActive(fromUrl);
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    const onResize = () => moveHighlight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
      const keyNumber = Number(event.key);
      if (keyNumber >= 1 && keyNumber <= VARIANTS.length) selectVariant(keyNumber - 1);
      else if (event.key === 'ArrowRight') selectVariant((active + 1) % VARIANTS.length);
      else if (event.key === 'ArrowLeft') selectVariant((active - 1 + VARIANTS.length) % VARIANTS.length);
      else if (event.key === 'r' || event.key === 'R') setRemount((value) => value + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  const Variant = VARIANTS[active].render;
  return (
    <HomeShell>
      <div className={s.shell}>
        <div key={`${active}-${remount}`} className={s.stage}><Variant /></div>
        <nav ref={picker} className="proto-picker" aria-label="Prototype variants" data-ready={ready || undefined}>
          <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
          {VARIANTS.map((variant, index) => <button key={variant.name} ref={(element) => { items.current[index] = element; }} className="proto-picker-item" data-active={active === index || undefined} aria-current={active === index ? 'true' : undefined} onClick={() => selectVariant(index)}>{variant.name}</button>)}
          <span className="proto-picker-divider" aria-hidden="true" />
          <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setRemount((value) => value + 1)}>↻</button>
        </nav>
      </div>
    </HomeShell>
  );
}
