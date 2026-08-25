'use client';

import { useRef } from 'react';
import s from '../SettingsModal.module.css';

export function OtpInput({
  value,
  onChange,
  onComplete,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('');

  function setDigit(i: number, d: string) {
    const clean = d.replace(/\D/g, '');
    if (clean === '' && d !== '') return;
    const arr = value.split('');
    arr[i] = clean.slice(-1) ?? '';
    const nextVal = arr.join('').slice(0, 6);
    onChange(nextVal);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (nextVal.length === 6) onComplete?.();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      if (pasted.length === 6) onComplete?.();
      else refs.current[pasted.length]?.focus();
    }
  }

  return (
    <div className={[s.otpBoxes, invalid ? s.otpBoxesError : ''].filter(Boolean).join(' ')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={s.otpBox}
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

export const COUNTRIES = [
  { code: 'US', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', dial: '+1', flag: '🇨🇦' },
  { code: 'GB', dial: '+44', flag: '🇬🇧' },
  { code: 'AU', dial: '+61', flag: '🇦🇺' },
  { code: 'IN', dial: '+91', flag: '🇮🇳' },
];

export type Country = (typeof COUNTRIES)[number];
