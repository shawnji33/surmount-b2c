'use client';

import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import s from './ClearableSearchInput.module.css';

const CLEAR_OUT_MS = 400;

export function ClearableSearchInput({
  value,
  onChange,
  placeholder = 'Search',
  ariaLabel,
  className,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [clearing, setClearing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  function handleClear() {
    if (!value || clearing) return;
    setClearing(true);
    timeoutRef.current = window.setTimeout(() => {
      onChange('');
      setClearing(false);
    }, CLEAR_OUT_MS);
  }

  const hasValue = value.length > 0;

  return (
    <div className={[s.wrap, hasValue ? s.hasValue : '', clearing ? s.isClearing : '', className].filter(Boolean).join(' ')}>
      <MagnifyingGlass weight="regular" className={s.icon} aria-hidden="true" />

      <div className={s.fieldBox}>
        <input
          type="text"
          className={[s.input, inputClassName].filter(Boolean).join(' ')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel ?? placeholder}
        />
        <div className={[s.mirror, inputClassName].filter(Boolean).join(' ')} aria-hidden="true">{value}</div>
        <div className={[s.placeholderText, inputClassName].filter(Boolean).join(' ')} aria-hidden="true">{placeholder}</div>
        <div className={s.glow} aria-hidden="true" />
      </div>

      {hasValue && !clearing && (
        <button type="button" className={s.clearBtn} onClick={handleClear} aria-label="Clear search">
          <X weight="bold" />
        </button>
      )}
    </div>
  );
}
