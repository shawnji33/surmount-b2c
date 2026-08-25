'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Question, X } from '@phosphor-icons/react';
import s from './SelectionActions.module.css';

export type DashboardSelection = {
  text: string;
  context: string;
  rect: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  };
};

export function SelectionActions({
  selection,
  onApply,
  onDismiss,
}: {
  selection: DashboardSelection;
  onApply: (instruction: string) => void;
  onDismiss: () => void;
}) {
  const [value, setValue] = useState('');
  const [position, setPosition] = useState({ left: selection.rect.left + selection.rect.width / 2, top: selection.rect.bottom + 8 });
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const bounds = bar.getBoundingClientRect();
    const viewportPadding = 12;
    const halfWidth = bounds.width / 2;
    const left = Math.min(
      window.innerWidth - viewportPadding - halfWidth,
      Math.max(viewportPadding + halfWidth, selection.rect.left + selection.rect.width / 2),
    );
    const fitsBelow = selection.rect.bottom + 8 + bounds.height <= window.innerHeight - viewportPadding;
    const top = fitsBelow
      ? selection.rect.bottom + 8
      : Math.max(viewportPadding, selection.rect.top - bounds.height - 8);
    setPosition({ left, top });
  }, [selection]);

  useEffect(() => {
    const dismissOnScroll = () => {
      // Focusing the toolbar input can cause a tiny browser scroll while it is brought into
      // view. That is not an intent to dismiss the edit the user just started typing.
      if (barRef.current?.contains(document.activeElement)) return;
      onDismiss();
    };
    const dismissOnPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) onDismiss();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('scroll', dismissOnScroll, true);
    document.addEventListener('pointerdown', dismissOnPointerDown, true);
    document.addEventListener('keydown', dismissOnEscape);
    window.addEventListener('resize', dismissOnScroll);
    return () => {
      document.removeEventListener('scroll', dismissOnScroll, true);
      document.removeEventListener('pointerdown', dismissOnPointerDown, true);
      document.removeEventListener('keydown', dismissOnEscape);
      window.removeEventListener('resize', dismissOnScroll);
    };
  }, [onDismiss]);

  function apply() {
    const instruction = value.trim();
    if (!instruction) return;
    onApply(instruction);
  }

  const hasValue = value.trim().length > 0;

  return createPortal(
    <div
      ref={barRef}
      className={s.bar}
      data-selection-actions
      role="toolbar"
      aria-label={`Actions for selected ${selection.context}`}
      style={{ left: position.left, top: position.top }}
      onPointerUp={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
    >
      <form
        className={s.form}
        onSubmit={(event) => {
          event.preventDefault();
          apply();
        }}
      >
        <label className={s.srOnly} htmlFor="selection-edit-instruction">Describe the requested change</label>
        <input
          id="selection-edit-instruction"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Describe edits"
          aria-label="Describe edits"
          autoComplete="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
        />
        <button type="submit" className={s.applyButton} disabled={!hasValue} aria-label="Add edit to prompt">
          <ArrowUp weight="bold" aria-hidden="true" />
        </button>
      </form>
      <span className={s.divider} aria-hidden="true" />
      <div className={s.quickActions}>
        <button type="button" className={s.quickAction} onClick={() => onApply('Explain this selection in plain language')}>
          <Question weight="regular" aria-hidden="true" />
          Explain
        </button>
      </div>
      <span className={s.divider} aria-hidden="true" />
      <button type="button" className={s.closeButton} onClick={onDismiss} aria-label="Close selection actions">
        <X weight="bold" aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}
