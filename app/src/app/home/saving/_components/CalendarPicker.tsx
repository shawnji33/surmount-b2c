'use client';

import { useState } from 'react';
import { MONTH_LONG, WEEKDAYS } from '../_data';
import { isWeekend, sameDay, todayMidnight } from '../_helpers';
import s from '../page.module.css';

export function CalendarPicker({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
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
          <div key={d} className={[s.calWeekday, (i === 0 || i === 6) ? s.weekend : ''].filter(Boolean).join(' ')}>{d}</div>
        ))}
      </div>
      <div className={s.calDays}>
        {cells.map((date, idx) => {
          if (!date) return <button key={`e${idx}`} className={`${s.calDay} ${s.calDayEmpty}`} type="button" tabIndex={-1} />;
          const isPast   = date < today;
          const isWknd   = isWeekend(date);
          const disabled = isPast || isWknd;
          const isToday  = sameDay(date, today);
          const isSel    = selected ? sameDay(date, selected) : isToday;
          const cls = [s.calDay, isToday ? s.calDayToday : '', isSel ? s.calDaySelected : '', isWknd ? s.weekend : ''].filter(Boolean).join(' ');
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
