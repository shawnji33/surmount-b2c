'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HomeShell } from '@/app/home/HomeShell';
import { GuidedVariant } from './guided/GuidedVariant';
import { FloatingVariant } from './floating/FloatingVariant';
import { TabbedVariant } from './tabbed/TabbedVariant';
import s from './page.module.css';

const VARIANTS = [
  { name: 'Guided', render: GuidedVariant },
  { name: 'Floating', render: FloatingVariant },
  { name: 'Tabbed', render: TabbedVariant },
];

export default function EtfBuilderPrototype() {
  const [active, setActive] = useState(0);
  const [remount, setRemount] = useState(0);
  const [ready, setReady] = useState(false);
  const [pickerOffset, setPickerOffset] = useState({ x: 0, y: 0 });
  const [pickerDragging, setPickerDragging] = useState(false);
  const pickerDragOrigin = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  // Harness-only convenience, not a picker restyle: PICKER.md fixes it to bottom/top-center so it
  // never becomes part of the design being judged, but on this route it can still land on top of
  // page content either way. Dragging just adds a live translate on top of the spec's own
  // translateX(-50%) centering — the pill looks identical at rest (offset starts at 0,0).
  function onPickerPointerDown(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button')) return;
    pickerDragOrigin.current = { x: event.clientX, y: event.clientY, offsetX: pickerOffset.x, offsetY: pickerOffset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setPickerDragging(true);
  }
  function onPickerPointerMove(event: React.PointerEvent<HTMLElement>) {
    const origin = pickerDragOrigin.current;
    if (!origin) return;
    setPickerOffset({ x: origin.offsetX + (event.clientX - origin.x), y: origin.offsetY + (event.clientY - origin.y) });
  }
  function onPickerPointerUp() {
    pickerDragOrigin.current = null;
    setPickerDragging(false);
  }
  function onPickerDoubleClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button')) return;
    setPickerOffset({ x: 0, y: 0 });
  }

  // Matches the real builder route (BuilderWorkspace.tsx): the shared dashboard shell paints no
  // background of its own, so the builder surface owns document.body's background for as long as
  // this route is mounted, restoring it on unmount.
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
          data-position="top"
          onPointerDown={onPickerPointerDown}
          onPointerMove={onPickerPointerMove}
          onPointerUp={onPickerPointerUp}
          onPointerCancel={onPickerPointerUp}
          onDoubleClick={onPickerDoubleClick}
          style={{
            transform: `translate(calc(-50% + ${pickerOffset.x}px), ${pickerOffset.y}px)`,
            cursor: pickerDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
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
