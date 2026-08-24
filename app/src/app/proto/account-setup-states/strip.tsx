'use client';

import { useState } from 'react';
import { AccountSetupPreview, STATES, type AccountState } from './shared';
import s from './page.module.css';

export default function StripVariant() {
  const [state, setState] = useState<AccountState>('verification-required');
  return <div className={s.variant}><div className={s.variantIntro}><span>Variant 1 · Scan-first</span><h1>Status strip</h1><p>Every state is visible at once for quick comparison.</p></div><div className={s.statusStrip} role="tablist" aria-label="Account setup preview state">{STATES.map((option) => <button key={option.id} type="button" role="tab" aria-selected={state === option.id} data-active={state === option.id || undefined} onClick={() => setState(option.id)}>{option.label}</button>)}</div><AccountSetupPreview state={state} onState={setState} /></div>;
}
