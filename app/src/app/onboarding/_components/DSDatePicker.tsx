'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import s from './onboarding.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type DateValue = { y: number; m: number; d: number };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseMDY(str: string): DateValue | null {
  const m = str.replace(/\s+/g, '').match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!m) return null;
  const mm = +m[1], dd = +m[2], yy = +m[3];
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yy < 1900 || yy > 2100) return null;
  const dt = new Date(yy, mm - 1, dd);
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null;
  return { y: yy, m: mm - 1, d: dd };
}

function formatMDY(v: DateValue): string {
  return (
    String(v.m + 1).padStart(2, '0') +
    ' / ' + String(v.d).padStart(2, '0') +
    ' / ' + v.y
  );
}

function applyMask(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += ' / ' + d.slice(2, 4);
  if (d.length > 4) out += ' / ' + d.slice(4, 8);
  return out;
}

function isValidDate(v: DateValue): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dt = new Date(v.y, v.m, v.d);
  return dt <= today && v.y >= 1900;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="40" y="40" width="176" height="176" rx="8"/>
    <line x1="176" y1="24" x2="176" y2="56"/>
    <line x1="80" y1="24" x2="80" y2="56"/>
    <line x1="40" y1="88" x2="216" y2="88"/>
  </svg>
);

const CaretLeft = () => (
  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="160 208 80 128 160 48"/>
  </svg>
);

const CaretRight = () => (
  <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="96 48 176 128 96 208"/>
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

type DSDatePickerProps = {
  label?: string;
  id?: string;
  error?: boolean;
  errorText?: string;
  onValueChange?: (v: DateValue | null) => void;
};

export function DSDatePicker({ label = 'Date of birth', id = 'dob', error = false, errorText, onValueChange }: DSDatePickerProps) {
  const today = new Date();
  const [raw, setRaw] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [viewY, setViewY] = useState(today.getFullYear() - 25);
  const [viewM, setViewM] = useState(today.getMonth());
  const [sel, setSel] = useState<DateValue | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFloated = focused || raw.length > 0;
  const displayError = errorText || internalError;

  // click-outside + escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = applyMask(e.target.value);
    setRaw(masked);
    const parsed = parseMDY(masked);
    if (parsed) {
      setSel(parsed);
      setViewY(parsed.y);
      setViewM(parsed.m);
      if (isValidDate(parsed)) { setInternalError(''); onValueChange?.(parsed); }
      else { setInternalError('Please enter a valid date of birth.'); onValueChange?.(null); }
    } else {
      if (masked.length === 0) { setSel(null); setInternalError(''); onValueChange?.(null); }
    }
  }

  function handleBlur() {
    setFocused(false);
    if (raw.length > 0 && !parseMDY(raw)) setInternalError('Please enter a valid date of birth.');
    else if (raw.length === 0) setInternalError('');
  }

  function pickDay(v: DateValue) {
    setSel(v);
    setViewY(v.y);
    setViewM(v.m);
    const formatted = formatMDY(v);
    setRaw(formatted);
    if (isValidDate(v)) { setInternalError(''); onValueChange?.(v); }
    else { setInternalError('Please enter a valid date of birth.'); onValueChange?.(null); }
    setOpen(false);
    setFocused(false);
  }

  function shiftMonth(delta: number) {
    let y = viewY, m = viewM + delta;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewY(y); setViewM(m);
  }

  const cells = useMemo(() => {
    const firstDow = new Date(viewY, viewM, 1).getDay();
    const dim = new Date(viewY, viewM + 1, 0).getDate();
    const dimPrev = new Date(viewY, viewM, 0).getDate();
    const out: { v: DateValue; other: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      let y: number, m: number, d: number, other = false;
      if (i < firstDow) {
        d = dimPrev - firstDow + 1 + i;
        m = viewM === 0 ? 11 : viewM - 1;
        y = viewM === 0 ? viewY - 1 : viewY;
        other = true;
      } else if (i >= firstDow + dim) {
        d = i - firstDow - dim + 1;
        m = viewM === 11 ? 0 : viewM + 1;
        y = viewM === 11 ? viewY + 1 : viewY;
        other = true;
      } else {
        d = i - firstDow + 1; m = viewM; y = viewY;
      }
      out.push({ v: { y, m, d }, other });
    }
    return out;
  }, [viewY, viewM]);

  const hasError = error || !!displayError;

  return (
    <div ref={wrapRef} className={s.dpWrap}>
      {/* Input shell (same floating label pattern as DSInput) */}
      <div className={s.dsInputWrap}>
        <label
          htmlFor={id}
          className={`${s.dsInputShell} ${hasError ? s.dsInputShellError : ''}`}
        >
          <div className={s.dsInputInner}>
            <span className={`${s.dsLabel} ${isFloated ? s.dsLabelFloat : ''}`}>{label}</span>
            <input
              ref={inputRef}
              id={id}
              type="text"
              inputMode="numeric"
              autoComplete="bday"
              placeholder={isFloated ? 'MM / DD / YYYY' : ''}
              value={raw}
              onChange={handleChange}
              onFocus={() => { setFocused(true); setOpen(true); }}
              onBlur={handleBlur}
              className={`${s.dsNativeInput} ${!isFloated ? s.dsNativeInputHide : ''}`}
              aria-invalid={hasError}
            />
          </div>
          <span className={s.dsTrailing} style={{ color: open ? 'var(--color-fg-primary-900, #181d27)' : undefined }}>
            <CalendarIcon />
          </span>
        </label>
        {hasError && displayError && (
          <span className={`${s.dsInputMsg} ${s.dsInputMsgError}`} role="alert">
            <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="128" cy="128" r="96"/>
              <line x1="128" y1="88" x2="128" y2="136"/>
              <circle cx="128" cy="168" r="8" fill="currentColor" stroke="none"/>
            </svg>
            {displayError}
          </span>
        )}
      </div>

      {/* Calendar popover */}
      <div
        role="dialog"
        aria-label="Choose date"
        aria-modal="false"
        className={`${s.dpCalendar} ${open ? s.dpCalendarOpen : s.dpCalendarClosed}`}
      >
        {/* Header */}
        <div className={s.dpCalHeader}>
          <button type="button" className={s.dpNavBtn} onClick={(e) => { e.stopPropagation(); shiftMonth(-1); }} aria-label="Previous month">
            <CaretLeft />
          </button>
          <div className={s.dpMonthLabel}>
            <span>{MONTHS[viewM]}</span>
            <span style={{ color: 'var(--color-fg-tertiary-600, #535861)' }}>{viewY}</span>
          </div>
          <button type="button" className={s.dpNavBtn} onClick={(e) => { e.stopPropagation(); shiftMonth(1); }} aria-label="Next month">
            <CaretRight />
          </button>
        </div>

        {/* Day-of-week row */}
        <div className={s.dpDowRow} aria-hidden="true">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d} className={s.dpDow}>{d}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className={s.dpGrid} role="grid">
          {cells.map(({ v, other }, i) => {
            const isSel = sel && sel.y === v.y && sel.m === v.m && sel.d === v.d;
            return (
              <button
                key={i}
                type="button"
                role="gridcell"
                aria-selected={!!isSel}
                onClick={() => pickDay(v)}
                className={`${s.dpDay} ${other ? s.dpDayOther : ''} ${isSel ? s.dpDaySelected : ''}`}
              >
                {v.d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
