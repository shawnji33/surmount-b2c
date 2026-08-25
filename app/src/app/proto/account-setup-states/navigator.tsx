'use client';

import { useState } from 'react';
import { AccountSetupPreview, STATES, type AccountState } from './shared';
import s from './page.module.css';

export default function NavigatorVariant() {
  const [state, setState] = useState<AccountState>('documents-review');
  return <div className={s.variant}><div className={s.variantIntro}><span>Variant 2 · Guided</span><h1>Milestone navigator</h1><p>A clear vertical sequence makes edge cases easy to inspect.</p></div><div className={s.navigatorLayout}><aside className={s.stateNavigator} aria-label="Account setup preview state"><p>Preview state</p>{STATES.map((option, index) => <button key={option.id} type="button" data-active={state === option.id || undefined} onClick={() => setState(option.id)}><span>{index + 1}</span><div><strong>{option.label}</strong><small>{option.phase}</small></div></button>)}</aside><AccountSetupPreview state={state} onState={setState} /></div></div>;
}
