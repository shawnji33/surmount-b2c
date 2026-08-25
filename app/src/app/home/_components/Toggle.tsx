'use client';

import s from '../page.module.css';

export function Toggle({ on, onChange }: { on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={s.toggleSwitch}
    >
      <span className={s.toggleThumb} />
    </button>
  );
}
