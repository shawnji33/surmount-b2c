'use client';

import { useEffect, useRef, useState } from 'react';
import s from './onboarding.module.css';

type DSDropdownProps = {
  label: string;
  id?: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  errorText?: string;
  placeholder?: string;
};

const CheckIcon = () => (
  <svg className={s.ddItemCheck} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="40 128 104 192 224 72"/>
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`${s.ddChevron} ${open ? s.ddChevronOpen : ''}`}
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeWidth="20"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="208 96 128 176 48 96"/>
  </svg>
);

const WarnIcon = () => (
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
    <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm-8,80a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,72a12,12,0,1,1,12-12A12,12,0,0,1,128,176Z"/>
  </svg>
);

export function DSDropdown({
  label,
  id,
  options,
  value,
  onChange,
  error = false,
  errorText,
  placeholder: _placeholder,
}: DSDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hasError = error || !!errorText;
  const isFloated = !!value || open;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={s.ddWrap}>
      {/* Trigger — looks identical to DSInput shell */}
      <div
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        tabIndex={0}
        className={[
          s.dsInputShell,
          s.dsInputShellSelect,
          hasError ? s.dsInputShellError : '',
          open ? s.dsInputShellOpen : '',
        ].filter(Boolean).join(' ')}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
        }}
      >
        <div className={s.dsInputInner}>
          <span className={`${s.dsLabel} ${isFloated ? s.dsLabelFloat : ''}`}>
            {label}
          </span>
          <span className={`${s.dsNativeInput} ${!value ? s.dsNativeInputHide : ''}`}>
            {value}
          </span>
        </div>
        <span className={s.dsTrailing}>
          <ChevronIcon open={open} />
        </span>
      </div>

      {/* Popover listbox */}
      <div
        role="listbox"
        aria-label={label}
        className={`${s.ddPopover} ${open ? s.ddPopoverOpen : s.ddPopoverClosed}`}
      >
        {options.map(opt => (
          <div
            key={opt}
            role="option"
            aria-selected={opt === value}
            className={`${s.ddItem} ${opt === value ? s.ddItemSelected : ''}`}
            onClick={() => { onChange(opt); setOpen(false); }}
          >
            <span>{opt}</span>
            {opt === value && <CheckIcon />}
          </div>
        ))}
      </div>

      {hasError && errorText && (
        <span className={s.ddMsg} role="alert">
          <WarnIcon />
          {errorText}
        </span>
      )}
    </div>
  );
}
