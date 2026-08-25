'use client';

import { useState } from 'react';
import { ArrowRight, Check, EnvelopeSimple, FileText, XCircle } from '@phosphor-icons/react';
import { DocumentReceipt, FlowRail, nextState, StateCopy, StatePill, StateSwitch, type ApplicationState } from './shared';
import s from './page.module.css';

export default function CommandCenterVariant() {
  const [state, setState] = useState<ApplicationState>('link-bank');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const complete = state === 'application-review' || state === 'documents-review' ? 1 : state === 'link-bank' ? 1 : state === 'first-deposit' ? 2 : state === 'pick-strategy' ? 3 : 0;
  const next = () => {
    if (state === 'application-review' || state === 'documents-review') {
      setStatusOpen(true);
      if (state === 'documents-review') setReceiptOpen(true);
      return;
    }
    if (state === 'rejected') return;
    const nextStateValue = nextState(state);
    if (nextStateValue) setState(nextStateValue);
  };

  return (
    <div className={s.variantStage}>
      <header className={s.protoHeader}><div><span className={s.protoBrandMark}>∞</span><span>Surmount</span></div><span>Application prototype</span></header>
      <main className={s.prototypeCanvas}>
        <div className={s.commandHero}><div><p>Investing account setup</p><h1>One clear action at a time.</h1><span>Everything you need before your first investment.</span></div><div className={s.commandProgress}><strong>{complete}<small>/4</small></strong><span>milestones complete</span></div></div>
        <StateSwitch value={state} onChange={(value) => { setState(value); setReceiptOpen(false); setStatusOpen(false); }} />
        <section className={s.commandLayout} aria-label="Command center application progress widget">
          <article className={s.commandTask} data-danger={state === 'rejected' || undefined}>
            <header><div><span className={s.widgetEyebrow}>Your current task</span><StatePill state={state} /></div><span>{complete} of 4 complete</span></header>
            <div className={s.commandTaskBody}><StateCopy state={state} />{statusOpen && (state === 'application-review' || state === 'documents-review') && <p className={s.reviewNote}>No action is needed from you right now. We&apos;ll email you as soon as there&apos;s an update.</p>}{state === 'documents-review' && <button type="button" className={s.receiptTrigger} onClick={() => setReceiptOpen((value) => !value)}><FileText weight="regular" aria-hidden="true" />{receiptOpen ? 'Hide submission receipt' : 'See submitted documents'}</button>}{receiptOpen && <DocumentReceipt />}</div>
            <footer>{state === 'rejected' ? <a href="mailto:support@surmount.ai?subject=Application%20support"><EnvelopeSimple weight="bold" aria-hidden="true" />Email support</a> : <button type="button" onClick={next}>{state === 'application-review' || state === 'documents-review' ? 'See status' : 'Continue setup'}<ArrowRight weight="bold" aria-hidden="true" /></button>}<span>{state === 'rejected' ? <><XCircle weight="fill" aria-hidden="true" />Account setup is closed</> : <><Check weight="bold" aria-hidden="true" />Saved automatically</>}</span></footer>
          </article>
          <aside className={s.commandSteps}><header><span>All milestones</span><span>Open overview</span></header><FlowRail state={state} /><p>Open a milestone to see exactly what it needs.</p></aside>
        </section>
      </main>
    </div>
  );
}
