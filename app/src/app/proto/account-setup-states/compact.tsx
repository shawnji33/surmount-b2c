'use client';

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useState } from 'react';
import { AccountSetupPreview, STATES, type AccountState } from './shared';
import s from './page.module.css';

export default function CompactVariant() {
  const [state, setState] = useState<AccountState>('approved');
  const index = STATES.findIndex((option) => option.id === state);
  const select = (offset: number) => setState(STATES[(index + offset + STATES.length) % STATES.length].id);
  return <div className={s.variant}><div className={s.variantIntro}><span>Variant 3 · Minimal</span><h1>Compact selector</h1><p>The state control stays out of the way until you need it.</p></div><div className={s.compactControl}><label htmlFor="account-state">Preview state</label><div><button type="button" aria-label="Previous preview state" onClick={() => select(-1)}><CaretLeft weight="bold" aria-hidden="true" /></button><select id="account-state" value={state} onChange={(event) => setState(event.target.value as AccountState)}>{STATES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><button type="button" aria-label="Next preview state" onClick={() => select(1)}><CaretRight weight="bold" aria-hidden="true" /></button></div></div><AccountSetupPreview state={state} onState={setState} /></div>;
}
