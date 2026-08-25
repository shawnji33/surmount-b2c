'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, EnvelopeSimple, FileText, XCircle } from '@phosphor-icons/react';
import { DocumentReceipt, nextState, StateCopy, StatePill, StateSwitch, type ApplicationState } from './shared';
import s from './page.module.css';

const LOG_ITEMS = [
  ['Application submitted', 'Mar 3, 2026 · 3:18 PM ET'],
  ['Identity documents received', 'Mar 4, 2026 · 10:42 AM ET'],
  ['Application review started', 'Mar 4, 2026 · 10:44 AM ET'],
];

export default function LedgerVariant() {
  const [state, setState] = useState<ApplicationState>('application-review');
  const [receiptOpen, setReceiptOpen] = useState(true);
  const next = () => {
    if (state === 'application-review' || state === 'documents-review') {
      setReceiptOpen(true);
      return;
    }
    if (state === 'rejected') return;
    const nextValue = nextState(state);
    if (nextValue) setState(nextValue);
  };

  return (
    <div className={s.variantStage}>
      <header className={s.protoHeader}><div><span className={s.protoBrandMark}>∞</span><span>Surmount</span></div><span>Application prototype</span></header>
      <main className={s.prototypeCanvas}>
        <div className={s.ledgerHero}><div><p>Surmount investing account</p><h1>Application activity</h1><span>Every submission, review, and next step in one place.</span></div><StatePill state={state} /></div>
        <StateSwitch value={state} onChange={(value) => { setState(value); setReceiptOpen(value === 'documents-review'); }} />
        <section className={s.ledgerLayout} aria-label="Application status ledger widget">
          <article className={s.ledgerCard}>
            <header><div><span className={s.widgetEyebrow}>Application timeline</span><h2>What’s happened so far</h2></div><span>Updated today</span></header>
            <ol className={s.activityList}>{LOG_ITEMS.map(([title, time], index) => <li key={title} data-active={index === LOG_ITEMS.length - 1 || undefined}><span>{index === LOG_ITEMS.length - 1 ? <CheckCircle weight="fill" aria-hidden="true" /> : <FileText weight="regular" aria-hidden="true" />}</span><div><strong>{title}</strong><small>{time}</small></div></li>)}</ol>
            <button type="button" className={s.ledgerReceiptToggle} onClick={() => setReceiptOpen((value) => !value)}><FileText weight="regular" aria-hidden="true" />{receiptOpen ? 'Hide submitted documents' : 'View submitted documents'}</button>
            {receiptOpen && <DocumentReceipt />}
          </article>
          <aside className={s.ledgerDecision} data-danger={state === 'rejected' || undefined}><StateCopy state={state} />{state === 'rejected' ? <a href="mailto:support@surmount.ai?subject=Application%20support"><EnvelopeSimple weight="bold" aria-hidden="true" />Email support</a> : <button type="button" onClick={next}>{state === 'application-review' || state === 'documents-review' ? 'Open details' : 'Continue'}<ArrowRight weight="bold" aria-hidden="true" /></button>}<div>{state === 'rejected' ? <><XCircle weight="fill" aria-hidden="true" />This decision is final for this application.</> : <>For security, we’ll always email you when your status changes.</>}</div></aside>
        </section>
      </main>
    </div>
  );
}
