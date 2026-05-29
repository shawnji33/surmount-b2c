'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import OnboardingFlow from '../_components/OnboardingFlow';
import Brand from '../_components/Brand';
import s from './page.module.css';

// ── constants ────────────────────────────────────────────────────────────────
const QUICK_AMOUNTS = [100, 500, 1000, 5000];
const FREQ_OPTIONS  = ['Monthly', 'Bi-weekly', 'Weekly'] as const;
const MONTH_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS    = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── helpers ───────────────────────────────────────────────────────────────────
function todayMidnight() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
function isWeekend(d: Date) { return d.getDay() === 0 || d.getDay() === 6; }

// ── Calendar sub-component ────────────────────────────────────────────────────
function CalendarPicker({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = todayMidnight();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(year, month, 1);
  const startDow     = firstOfMonth.getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  const prevDisabled = year === today.getFullYear() && month <= today.getMonth();

  function prevMonth() {
    if (prevDisabled) return;
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className={s.cal}>
      <div className={s.calHeader}>
        <button className={s.calNav} type="button" onClick={prevMonth} disabled={prevDisabled} aria-label="Previous month">
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="160 208 80 128 160 48"/>
          </svg>
        </button>
        <span className={s.calMonthLabel}>{MONTH_LONG[month]} {year}</span>
        <button className={s.calNav} type="button" onClick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="96 48 176 128 96 208"/>
          </svg>
        </button>
      </div>

      <div className={s.calWeekdays}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`${s.calWeekday} ${(i === 0 || i === 6) ? s.weekend : ''}`}>{d}</div>
        ))}
      </div>

      <div className={s.calDays}>
        {cells.map((date, idx) => {
          if (!date) return <button key={`e${idx}`} className={`${s.calDay} ${s.calDayEmpty}`} type="button" tabIndex={-1} />;
          const isPast    = date < today;
          const isWknd    = isWeekend(date);
          const disabled  = isPast || isWknd;
          const isToday   = sameDay(date, today);
          const isSel     = selected ? sameDay(date, selected) : isToday;
          let cls = s.calDay;
          if (isToday) cls += ` ${s.calDayToday}`;
          if (isSel)   cls += ` ${s.calDaySelected}`;
          if (isWknd)  cls += ` ${s.weekend}`;
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={cls}
              disabled={disabled}
              aria-label={`${MONTH_LONG[month]} ${date.getDate()}, ${year}`}
              aria-pressed={isSel}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FundAmountPage() {
  const router = useRouter();

  // amount
  const [rawAmount,  setRawAmount]  = useState(0);
  const [inputValue, setInputValue] = useState('$');
  const [animKey,    setAnimKey]    = useState(0);

  // repeat
  const [repeat,      setRepeat]      = useState(false);
  const [freq,        setFreq]        = useState<typeof FREQ_OPTIONS[number]>('Monthly');
  const [freqOpen,    setFreqOpen]    = useState(false);
  const [freqExiting, setFreqExiting] = useState(false);

  // date picker
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dpOpen,    setDpOpen]    = useState(false);
  const [dpExiting, setDpExiting] = useState(false);
  const [dpPos,     setDpPos]     = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  // refs
  const freqRef         = useRef<HTMLDivElement>(null);
  const dpRef           = useRef<HTMLDivElement>(null);
  const startsTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (freqOpen && !freqExiting && freqRef.current && !freqRef.current.contains(e.target as Node)) {
        setFreqExiting(true);
      }
      if (dpOpen && !dpExiting && dpRef.current && !dpRef.current.contains(e.target as Node) &&
          !(startsTriggerRef.current?.contains(e.target as Node))) {
        setDpExiting(true);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (freqOpen && !freqExiting) setFreqExiting(true);
        if (dpOpen   && !dpExiting)   setDpExiting(true);
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown',   onKey);
    };
  }, [freqOpen, dpOpen, freqExiting, dpExiting]);

  // ── amount handlers ──────────────────────────────────────────────
  const applyAmount = useCallback((val: number) => {
    setRawAmount(val);
    setInputValue('$' + val.toLocaleString());
    setAnimKey(k => k + 1);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setRawAmount(parseInt(digits) || 0);
    setInputValue('$' + digits);
  }
  function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    const digits = inputValue.replace(/[$,]/g, '');
    setInputValue('$' + digits);
    setTimeout(() => e.target.setSelectionRange(1, e.target.value.length), 0);
  }
  function handleInputBlur() {
    if (rawAmount > 0) setInputValue('$' + rawAmount.toLocaleString());
    else setInputValue('$');
  }

  // ── date helper ──────────────────────────────────────────────────
  const today = todayMidnight();
  function startsLabel() {
    if (!startDate || sameDay(startDate, today)) return 'Starts today';
    return `Starts ${MONTH_SHORT[startDate.getMonth()]} ${startDate.getDate()}`;
  }

  const isValid = rawAmount > 0;

  // ── card/section shared styles ───────────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border-secondary)',
    borderRadius: 'var(--radius-xl)',
    padding: 21,
    boxShadow: '0 2px 12px rgba(10,13,18,0.03)',
  };

  return (
    <OnboardingFlow>
      <main style={{
        flex: 1,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              alignSelf: 'flex-start', width: 40, height: 40,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-fg-tertiary-600)',
              cursor: 'pointer', flexShrink: 0,
              transition: 'background 150ms ease',
            }}
          >
            <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }} aria-hidden="true">
              <line x1="216" y1="128" x2="40" y2="128"/>
              <polyline points="112 56 40 128 112 200"/>
            </svg>
          </button>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 24, fontWeight: 500,
            lineHeight: '32px', letterSpacing: '-0.4px',
            color: 'var(--color-fg-secondary-700)',
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            Fund{' '}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              color: 'var(--color-fg-primary-900)',
              verticalAlign: 'middle',
            }}>
              <span style={{
                width: 26, height: 26,
                borderRadius: '50%',
                overflow: 'hidden', flexShrink: 0,
                border: '0.5px solid rgba(0,0,0,0.08)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brand size={26} />
              </span>
              Surmount brokerage account
            </span>
          </h1>

          {/* ── Amount card ── */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 74, overflow: 'hidden' }}>
              <div key={animKey} className={s.amountAnimate}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  autoFocus
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 64, fontWeight: 500,
                    color: rawAmount > 0 ? 'var(--color-fg-primary-900)' : 'rgba(10,13,18,0.2)',
                    lineHeight: '72px', letterSpacing: '-2px',
                    background: 'transparent', border: 'none', outline: 'none',
                    width: '100%', caretColor: 'var(--color-fg-primary-900)', padding: 0,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {QUICK_AMOUNTS.map(a => (
                <Chip key={a} label={`$${a.toLocaleString()}`} onClick={() => applyAmount(a)} />
              ))}
            </div>
          </div>

          {/* ── Repeat card ── */}
          <div style={{
            ...card,
            display: 'flex', flexDirection: 'column',
            transition: 'padding-bottom 280ms cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* toggle row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-fg-secondary-700)', lineHeight: '20px' }}>
                  Repeat
                </span>
                <Toggle on={repeat} onChange={setRepeat} />
              </div>

              {/* Freq pill — only visible when repeat on */}
              <div
                ref={freqRef}
                style={{
                  position: 'relative',
                  opacity: repeat ? 1 : 0,
                  pointerEvents: repeat ? 'all' : 'none',
                  transition: 'opacity 300ms ease',
                }}
              >
                <button
                  type="button"
                  aria-expanded={freqOpen && !freqExiting}
                  aria-haspopup="listbox"
                  onClick={() => {
                    if (freqOpen) { setFreqExiting(true); }
                    else { setFreqOpen(true); setFreqExiting(false); }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--color-bg-tertiary, #f5f5f5)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '10px 16px',
                    cursor: 'pointer', border: 'none',
                    fontFamily: 'var(--font-family-body)',
                    fontSize: 14, fontWeight: 500,
                    color: 'var(--color-fg-secondary-700)',
                    transition: 'background 120ms',
                  }}
                >
                  {freq}
                  <svg viewBox="0 0 14 14" style={{ width: 14, height: 14, stroke: 'rgba(10,13,18,0.4)', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
                    <polyline points="3 5 7 9 11 5"/>
                  </svg>
                </button>

                {freqOpen && (
                  <div
                    className={freqExiting ? s.popoverExit : s.popover}
                    role="listbox"
                    onAnimationEnd={() => { if (freqExiting) { setFreqOpen(false); setFreqExiting(false); } }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 4, minWidth: 150,
                      boxShadow: '0 8px 24px rgba(10,13,18,0.12)',
                    }}
                  >
                    {FREQ_OPTIONS.map(opt => (
                      <button
                        key={opt} type="button" role="option" aria-selected={opt === freq}
                        onClick={() => { setFreq(opt); setFreqExiting(true); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                          padding: '8px 12px', borderRadius: 'var(--radius-md)',
                          fontSize: 14, fontWeight: opt === freq ? 500 : 400,
                          color: 'var(--color-fg-primary-900)',
                          cursor: 'pointer', background: 'none', border: 'none',
                          fontFamily: 'inherit', width: '100%', textAlign: 'left',
                          transition: 'background 100ms',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        {opt}
                        {opt === freq && (
                          <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 14, height: 14, flexShrink: 0 }}>
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Expandable — starts date row */}
            <div style={{
              overflow: 'hidden',
              maxHeight: repeat ? 56 : 0,
              opacity: repeat ? 1 : 0,
              transition: 'max-height 280ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease, margin-top 280ms cubic-bezier(0.16,1,0.3,1)',
              marginTop: repeat ? 16 : 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <button
                  ref={startsTriggerRef}
                  type="button"
                  onClick={() => {
                    if (dpOpen) {
                      setDpExiting(true);
                    } else {
                      if (startsTriggerRef.current) {
                        const r = startsTriggerRef.current.getBoundingClientRect();
                        setDpPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
                      }
                      setDpOpen(true);
                      setDpExiting(false);
                    }
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-fg-secondary-700)', lineHeight: '20px' }}>
                    {startsLabel()}
                  </span>
                  {/* Phosphor PencilSimple */}
                  <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 14, height: 14, color: 'rgba(10,13,18,0.35)', flexShrink: 0 }}>
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Pay with ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-fg-quaternary-400)', lineHeight: '20px' }}>
              Pay with
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button type="button" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px', cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(10,13,18,0.03)',
                transition: 'border-color 120ms',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: '0.5px solid rgba(0,0,0,0.08)',
                  background: 'rgba(17,122,202,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Image src="/assets/illustrations/bank-chase.png" alt="Chase" width={16} height={16} style={{ objectFit: 'contain' }} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(10,13,18,0.9)', lineHeight: '20px', whiteSpace: 'nowrap' }}>Chase</span>
              </button>
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-fg-quaternary-400)', fontFamily: 'var(--font-family-display)', whiteSpace: 'nowrap' }}>
                $8,221.00 Available
              </span>
            </div>
          </div>

          {/* ── Review ── */}
          <button
            type="button"
            disabled={!isValid}
            onClick={() => {
              const p = new URLSearchParams();
              p.set('amount', rawAmount.toString());
              p.set('freq', repeat ? freq : 'Once');
              if (startDate && !sameDay(startDate, today)) {
                p.set('starts', `${MONTH_SHORT[startDate.getMonth()]} ${startDate.getDate()}`);
              }
              router.push(`/onboarding/fund-review?${p.toString()}`);
            }}
            style={{
              width: '100%', padding: '10px 16px',
              background: isValid ? 'var(--color-fg-primary-900)' : '#f5f5f5',
              border: `1px solid ${isValid ? 'var(--color-fg-primary-900)' : '#e9eaeb'}`,
              borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 500, letterSpacing: '-0.2px',
              color: isValid ? '#fff' : 'rgba(10,13,18,0.4)',
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'background 150ms, color 150ms, border-color 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Review
          </button>

        </div>
      </main>

      {dpOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dpRef}
          className={dpExiting ? s.popoverLeftExit : s.popoverLeft}
          onAnimationEnd={() => { if (dpExiting) { setDpOpen(false); setDpExiting(false); } }}
          style={{
            position: 'fixed',
            top: dpPos.top,
            right: dpPos.right,
            zIndex: 1000,
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 16,
            width: 290,
            boxShadow: '0 8px 32px rgba(10,13,18,0.14)',
          }}
        >
          <CalendarPicker
            selected={startDate}
            onSelect={d => { setStartDate(d); setDpExiting(true); }}
          />
        </div>,
        document.body
      )}
    </OnboardingFlow>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 32, padding: '0 12px',
        background: 'var(--color-bg-tertiary, #f5f5f5)',
        border: 'none', borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--font-family-display)',
        fontSize: 13, fontWeight: 500,
        color: 'var(--color-fg-secondary-700)',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'background 100ms, transform 80ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#ebebeb')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-tertiary, #f5f5f5)')}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {label}
    </button>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        position: 'relative',
        width: 44, height: 24,
        background: on ? 'var(--color-fg-primary-900)' : '#e9eaeb',
        borderRadius: 9999,
        padding: 2, cursor: 'pointer', border: 'none', flexShrink: 0,
        transition: 'background 220ms ease',
      }}
    >
      <span style={{
        display: 'block',
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(10,13,18,0.1)',
        position: 'absolute', top: 2,
        left: on ? 22 : 2,
        transition: 'left 200ms cubic-bezier(0.4,0,0.2,1)',
      }} />
    </button>
  );
}
