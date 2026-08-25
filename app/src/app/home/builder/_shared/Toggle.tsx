'use client';

import s from './Toggle.module.css';

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (value: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={s.toggle}
    >
      <span className={s.thumb} />
    </button>
  );
}
