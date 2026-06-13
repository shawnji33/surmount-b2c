'use client';

import { useEffect, useState } from 'react';
import { CaretDown, MagnifyingGlass } from '@phosphor-icons/react';
import type { ParamValue } from '../nodes/types';
import { formatValue, type CardRow, ACCOUNT_OPTIONS } from './agentModel';
import s from './cards.module.css';

/* The value edits in place — the token *is* the field. No popover:
   text/number/asset are inline inputs, selects are styled native dropdowns. */
export function ValueToken({
  row,
  value,
  changed,
  readOnly,
  onCommit,
}: {
  row: CardRow;
  value: ParamValue;
  changed?: boolean;
  readOnly?: boolean;
  onCommit: (v: ParamValue) => void;
}) {
  const ctrl = row.control;
  const [draft, setDraft] = useState(value === null ? '' : String(value));

  // stay in sync when the value changes elsewhere (NL edit, etc.)
  useEffect(() => {
    setDraft(value === null ? '' : String(value));
  }, [value]);

  if (readOnly) {
    return <span className={`${s.token} ${s.tokenReadonly}`}>{formatValue(row, value)}</span>;
  }

  // ── select / account-picker → styled native dropdown ──
  if (ctrl.type === 'select' || ctrl.type === 'account-picker') {
    const options = ctrl.type === 'select' ? ctrl.options : ACCOUNT_OPTIONS;
    return (
      <span className={`${s.token} ${s.tokenSelect} ${changed ? s.tokenChanged : ''}`}>
        <select
          className={s.tokenSelectEl}
          value={String(value ?? '')}
          onChange={(e) => onCommit(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <CaretDown size={13} className={s.tokenCaret} />
      </span>
    );
  }

  // ── number / text / asset-search → inline input ──
  const commit = () => {
    const next: ParamValue = ctrl.type === 'number' ? (draft === '' ? null : Number(draft)) : draft;
    if (next !== value) onCommit(next);
  };

  return (
    <span className={`${s.token} ${s.tokenInput} ${changed ? s.tokenChanged : ''}`}>
      {ctrl.type === 'asset-search' && <MagnifyingGlass size={13} className={s.tokenLead} />}
      {ctrl.type === 'number' && ctrl.affix === '$' && <span className={s.tokenAffix}>$</span>}
      <input
        className={s.tokenField}
        type={ctrl.type === 'number' ? 'number' : 'text'}
        value={draft}
        placeholder={'placeholder' in ctrl ? ctrl.placeholder : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {ctrl.type === 'number' && ctrl.affix === '%' && <span className={s.tokenAffix}>%</span>}
    </span>
  );
}
