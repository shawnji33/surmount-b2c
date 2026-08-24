'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HomeShell } from '@/app/home/HomeShell';
import { HeaderPillVariant } from './header-pill/HeaderPillVariant';
import { TopOfListVariant } from './top-of-list/TopOfListVariant';
import s from './page.module.css';

// Comparison prototype for one question: where should the "Add asset" trigger live relative to
// the holdings list? Header pill is the already-shipped baseline (production AllocationSection,
// unmodified, imported as-is — its header already carries AddAssetPill to the left of the
// Equal/Custom tabs). Top of list is the new direction being evaluated: the same morph-to-search
// interaction, but pinned as the first row inside the list itself. See TopOfListAllocationSection
// for why that placement required forking AllocationSection's shell rather than reusing it whole.
const VARIANTS = [
  { name: 'Header pill', render: HeaderPillVariant },
  { name: 'Top of list', render: TopOfListVariant },
];

export default function AddAssetPlacementPrototype() {
  const [active, setActive] = useState(0);
  const [remount, setRemount] = useState(0);
  const [ready, setReady] = useState(false);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  // Matches the real builder route (BuilderWorkspace.tsx): the shared dashboard shell paints no
  // background of its own, so the builder surface owns document.body's background for as long as
  // this route is mounted, restoring it on unmount. Same technique as the parent etf-builder proto.
  useLayoutEffect(() => {
    const previousBackground = document.body.style.background;
    document.body.style.background = 'var(--color-bg-tertiary, #f5f5f5)';
    return () => {
      document.body.style.background = previousBackground;
    };
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div key={`${active}-${remount}`} className={s.stage}>
          <Variant />
        </div>
        <nav
          ref={picker}
          className="proto-picker"
          aria-label="Prototype variants"
          data-ready={ready || undefined}
        >
          <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
          {VARIANTS.map((variant, index) => (
            <button
              key={variant.name}
              ref={(element) => { items.current[index] = element; }}
              className="proto-picker-item"
              data-active={active === index || undefined}
              aria-current={active === index ? 'true' : undefined}
              onClick={() => selectVariant(index)}
            >
              {variant.name}
            </button>
          ))}
          <span className="proto-picker-divider" aria-hidden="true" />
          <button className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setRemount((value) => value + 1)}>↻</button>
        </nav>
      </div>
    </HomeShell>
  );
}
