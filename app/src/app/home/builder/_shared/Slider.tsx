'use client';

import { useState, type CSSProperties } from 'react';
import s from './Slider.module.css';

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      className={[s.slider, dragging ? s.dragging : ''].filter(Boolean).join(' ')}
      style={{ '--pct': `${pct}%` } as CSSProperties}
    />
  );
}
