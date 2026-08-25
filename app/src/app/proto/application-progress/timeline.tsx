'use client';

import { useState } from 'react';
import { ArrowRight, CaretDown, EnvelopeSimple, FileText, Info, XCircle } from '@phosphor-icons/react';
import { DocumentReceipt, FlowRail, nextState, StateCopy, StatePill, StateSwitch, type ApplicationState } from './shared';
import s from './page.module.css';

export default function TimelineVariant() {
  const [state, setState] = useState<ApplicationState>('documents-review');
  const [details, setDetails] = useState(false);
  const advance = () => {
    if (state === 'application-review' || state === 'documents-review') {
      setDetails(true);
      return;
    }
    if (state === 'rejected') return;
    const next = nextState(state);
    if (next) setState(next);
    setDetails(true);
  };

  return (
    <div className={s.variantStage}>
      <header className={s.protoHeader}>
        <div><span className={s.protoBrandMark}>∞</span><span>Surmount</span></div>
        <span>Application prototype</span>
      </header>
      <main className={s.prototypeCanvas}>
        <div className={s.variantIntro}><p>Surmount investing account</p><h1>Your path to investing</h1><span>Track every step without losing the next action.</span></div>
        <StateSwitch value={state} onChange={(value) => { setState(value); setDetails(false); }} />
        <section className={s.timelineLayout} aria-label="Timeline application progress widget">
          <article className={s.timelineCard}>
            <header className={s.widgetTopline}><div><span className={s.widgetEyebrow}>Account application</span><StatePill state={state} /></div><button type="button" aria-expanded={details} onClick={() => setDetails((value) => !value)}>Details <CaretDown weight="bold" aria-hidden="true" /></button></header>
            <FlowRail state={state} />
            {details && <div className={s.timelineDetails}>{state === 'documents-review' && <DocumentReceipt />}{state === 'rejected' && <div className={s.rejectNotice}><XCircle weight="fill" aria-hidden="true" /><span>Need help understanding this decision? Contact our support team.</span></div>}{state !== 'documents-review' && state !== 'rejected' && <div className={s.infoNotice}><Info weight="fill" aria-hidden="true" />Your progress is saved automatically and you can return anytime.</div>}</div>}
          </article>
          <aside className={s.timelineAction} data-danger={state === 'rejected' || undefined}>
            <StateCopy state={state} />
            {state === 'rejected' ? <a href="mailto:support@surmount.ai?subject=Application%20support"><EnvelopeSimple weight="bold" aria-hidden="true" />Email support</a> : <button type="button" onClick={advance}>{state === 'application-review' || state === 'documents-review' ? 'See details' : 'Continue'}<ArrowRight weight="bold" aria-hidden="true" /></button>}
            <small>{state === 'rejected' ? 'Our support team typically responds within 1 business day.' : state === 'application-review' || state === 'documents-review' ? 'We’ll email you when there’s an update.' : 'Takes about 2 minutes.'}</small>
          </aside>
        </section>
      </main>
    </div>
  );
}
