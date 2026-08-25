'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CaretDown, Check, MagnifyingGlass } from '@phosphor-icons/react';
import type { ParamField, ParamValue } from '../nodes/types';
import s from './build.module.css';

const ACCOUNTS = ['Primary brokerage', 'HYCA', 'Bond ladder', 'Treasury', 'Bank'];

function Row({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={s.pField}>
      <div className={s.pLabelRow}>
        <span className={s.pLabel}>{label}</span>
      </div>
      {children}
      {error ? (
        <span className={s.fieldError}>{error}</span>
      ) : helper ? (
        <span className={s.fieldHelper}>{helper}</span>
      ) : null}
    </div>
  );
}

/* select → dropdown menu (reuses the panel dropdown styles) */
function SelectControl({
  options,
  value,
  onChange,
  comingSoon = [],
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  comingSoon?: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className={`${s.pInput} ${open ? s.pInputOpen : ''}`} type="button" onClick={() => setOpen((o) => !o)}>
        <span className={s.pInputVal}>{value || placeholder || 'Select…'}</span>
        <CaretDown size={16} />
      </button>
      {open && (
        <div className={s.pMenu}>
          {options.map((o) => {
            const soon = comingSoon.includes(o);
            return (
              <button
                key={o}
                className={`${s.pMenuItem} ${o === value ? s.pMenuItemSel : ''}`}
                disabled={soon}
                style={soon ? { opacity: 0.45 } : undefined}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                <span>
                  {o}
                  {soon ? ' · soon' : ''}
                </span>
                {o === value && <Check size={16} weight="bold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* 2–3 mutually-exclusive choices → segmented control */
function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={s.fieldSeg}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`${s.fieldSegBtn} ${o === value ? s.fieldSegOn : ''}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Field({
  field,
  value,
  onChange,
  error,
}: {
  field: ParamField;
  value: ParamValue;
  onChange: (v: ParamValue) => void;
  error?: string;
}) {
  const v = value ?? field.default ?? '';

  if (field.type === 'toggle') {
    return (
      <Row label={field.label} helper={field.helper} error={error}>
        <button
          type="button"
          className={`${s.fieldToggle} ${v ? s.fieldToggleOn : ''}`}
          onClick={() => onChange(!v)}
          aria-pressed={!!v}
        >
          <span />
        </button>
      </Row>
    );
  }

  if (field.type === 'select') {
    const opts = field.options ?? [];
    if (opts.length > 0 && opts.length <= 3 && !field.comingSoon?.length) {
      return (
        <Row label={field.label} helper={field.helper} error={error}>
          <Segmented options={opts} value={String(v)} onChange={onChange} />
        </Row>
      );
    }
    return (
      <Row label={field.label} helper={field.helper} error={error}>
        <SelectControl
          options={opts}
          value={String(v)}
          onChange={onChange}
          comingSoon={field.comingSoon}
          placeholder={opts.length ? 'Select…' : 'Connect an upstream node'}
        />
      </Row>
    );
  }

  if (field.type === 'account-picker') {
    return (
      <Row label={field.label} helper={field.helper} error={error}>
        <SelectControl options={ACCOUNTS} value={String(v) || 'Primary brokerage'} onChange={onChange} />
      </Row>
    );
  }

  if (field.type === 'number') {
    return (
      <Row label={field.label} helper={field.helper} error={error}>
        <div className={s.fieldNum}>
          {field.affix === '$' && <span className={s.fieldAffix}>$</span>}
          <input
            className={s.fieldInput}
            type="number"
            value={v === '' || v === null ? '' : String(v)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          />
          {field.affix === '%' && <span className={s.fieldAffixSuffix}>%</span>}
        </div>
      </Row>
    );
  }

  if (field.type === 'asset-search') {
    return (
      <Row label={field.label} helper={field.helper} error={error}>
        <div className={s.fieldNum}>
          <MagnifyingGlass size={15} className={s.fieldSearchIcon} />
          <input
            className={s.fieldInput}
            value={String(v)}
            placeholder={field.placeholder ?? 'Search ticker…'}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </Row>
    );
  }

  // text, time, value-ref, expression → text input
  return (
    <Row label={field.label} helper={field.helper} error={error}>
      <input
        className={s.fieldInput}
        value={String(v)}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Row>
  );
}
