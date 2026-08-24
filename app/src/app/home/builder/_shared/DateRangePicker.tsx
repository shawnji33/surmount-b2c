'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import s from './DateRangePicker.module.css';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function fmt(d: Date) {
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

type Preset = { label: string; range: () => [Date, Date] };

const today = () => startOfDay(new Date());

const PRESETS: Preset[] = [
  { label: 'Today', range: () => [today(), today()] },
  { label: 'This week', range: () => { const t = today(); const start = new Date(t); start.setDate(t.getDate() - t.getDay()); return [start, t]; } },
  { label: 'This month', range: () => { const t = today(); return [new Date(t.getFullYear(), t.getMonth(), 1), t]; } },
  { label: 'This year', range: () => { const t = today(); return [new Date(t.getFullYear(), 0, 1), t]; } },
  { label: 'Last 12 months', range: () => { const t = today(); const start = new Date(t); start.setFullYear(t.getFullYear() - 1); return [start, t]; } },
  { label: 'All time', range: () => [new Date(2015, 0, 1), today()] },
];

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date, end: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<Date | null>(startDate);
  const [pendingEnd, setPendingEnd] = useState<Date | null>(endDate);
  const [viewYear, setViewYear] = useState((startDate ?? today()).getFullYear());
  const [viewMonth, setViewMonth] = useState((startDate ?? today()).getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function openPicker() {
    setPendingStart(startDate);
    setPendingEnd(endDate);
    setOpen(true);
  }

  function pickDay(d: Date) {
    if (!pendingStart || (pendingStart && pendingEnd)) {
      setPendingStart(d);
      setPendingEnd(null);
    } else if (d < pendingStart) {
      setPendingStart(d);
      setPendingEnd(pendingStart);
    } else {
      setPendingEnd(d);
    }
  }

  function applyPreset(preset: Preset) {
    const [s0, e0] = preset.range();
    setPendingStart(s0);
    setPendingEnd(e0);
    setViewYear(s0.getFullYear());
    setViewMonth(s0.getMonth());
  }

  function apply() {
    if (pendingStart && pendingEnd) onChange(pendingStart, pendingEnd);
    setOpen(false);
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDow = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  const maxDate = today();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1);
  }

  return (
    <div className={s.wrap} ref={wrapRef}>
      <button type="button" className={s.trigger} onClick={openPicker}>
        <CalendarBlank weight="regular" />
        {startDate && endDate ? `${fmt(startDate)} - ${fmt(endDate)}` : 'Select a period'}
      </button>

      {open && (
        <div className={s.popover} role="dialog" aria-label="Select a date range">
          <div className={s.presets}>
            {PRESETS.map((p) => (
              <button type="button" key={p.label} className={s.presetBtn} onClick={() => applyPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className={s.calendarSide}>
            <div className={s.calHeader}>
              <button type="button" className={s.calNav} onClick={prevMonth} aria-label="Previous month">
                <CaretLeft weight="bold" />
              </button>
              <span className={s.calMonthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
              <button type="button" className={s.calNav} onClick={nextMonth} aria-label="Next month">
                <CaretRight weight="bold" />
              </button>
            </div>

            <div className={s.calWeekdays}>
              {WEEKDAYS.map((d, i) => <div key={`${d}${i}`} className={s.calWeekday}>{d}</div>)}
            </div>

            <div className={s.calDays}>
              {cells.map((date, idx) => {
                if (!date) return <span key={`e${idx}`} className={s.calDayEmpty} />;
                const disabled = date > maxDate;
                const isStart = pendingStart ? sameDay(date, pendingStart) : false;
                const isEnd = pendingEnd ? sameDay(date, pendingEnd) : false;
                const inRange = pendingStart && pendingEnd ? date > pendingStart && date < pendingEnd : false;
                const cls = [
                  s.calDay,
                  isStart || isEnd ? s.calDaySelected : '',
                  inRange ? s.calDayInRange : '',
                ].filter(Boolean).join(' ');
                return (
                  <button
                    type="button"
                    key={date.toISOString()}
                    className={cls}
                    disabled={disabled}
                    onClick={() => pickDay(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className={s.footer}>
              <span className={s.footerRange}>
                {pendingStart ? fmt(pendingStart) : 'Start'} – {pendingEnd ? fmt(pendingEnd) : 'End'}
              </span>
              <div className={s.footerActions}>
                <button type="button" className={s.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
                <button type="button" className={s.applyBtn} disabled={!pendingStart || !pendingEnd} onClick={apply}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
