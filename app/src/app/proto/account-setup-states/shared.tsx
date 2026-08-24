'use client';

import { Bank, Check, CheckCircle, Clock, CurrencyDollar, FileText, Sparkle, WarningCircle } from '@phosphor-icons/react';
import s from './page.module.css';

export const STATES = [
  { id: 'submitted', label: 'Application review', phase: 'Reviewing' },
  { id: 'verification-required', label: 'Verification required', phase: 'Action needed' },
  { id: 'documents-review', label: 'Documents under review', phase: 'Reviewing' },
  { id: 'documents-rejected', label: 'Verification unsuccessful', phase: 'Action needed' },
  { id: 'approved', label: 'Application approved', phase: 'Approved' },
  { id: 'bank-linked', label: 'Bank connected', phase: 'Set up' },
  { id: 'funded', label: 'First deposit complete', phase: 'Set up' },
  { id: 'ready', label: 'Ready to invest', phase: 'Complete' },
] as const;

export type AccountState = (typeof STATES)[number]['id'];

const CONTENT: Record<AccountState, { title: string; body: string; tone: string; action?: string }> = {
  submitted: { title: 'Your application is under review', body: 'We have everything we need. Most applications are reviewed within 1–2 business days.', tone: 'review' },
  'verification-required': { title: 'Verify your identity', body: 'Our brokerage partner needs two additional documents before they can approve your application.', tone: 'action', action: 'Upload documents' },
  'documents-review': { title: 'Your documents are under review', body: 'Your documents were received on Aug 11, 2026 at 10:42 AM ET. We’ll email you as soon as there’s an update.', tone: 'review' },
  'documents-rejected': { title: 'We couldn’t verify your documents', body: 'One or more documents need attention. Upload replacements to restart verification.', tone: 'danger', action: 'Upload new documents' },
  approved: { title: 'Your application is approved', body: 'Connect a bank account so you can securely move money into Surmount.', tone: 'success', action: 'Connect your bank' },
  'bank-linked': { title: 'Your bank is connected', body: 'Chase •••• 4721 is ready. Make your first deposit whenever you’re ready.', tone: 'action', action: 'Make a deposit' },
  funded: { title: 'Your first deposit is complete', body: '$1,000.00 is available to invest. Pick a strategy to put it to work.', tone: 'action', action: 'Pick a strategy' },
  ready: { title: 'You’re ready to invest', body: 'Your account is active, funded, and ready for your first strategy.', tone: 'success', action: 'Browse strategies' },
};

const FLOW = [
  { label: 'Submit your application', icon: FileText },
  { label: 'Connect your bank account', icon: Bank },
  { label: 'Make your first deposit', icon: CurrencyDollar },
  { label: 'Pick your first strategy', icon: Sparkle },
];

const NEXT_STATE: Record<AccountState, AccountState> = {
  submitted: 'approved',
  'verification-required': 'documents-review',
  'documents-review': 'approved',
  'documents-rejected': 'verification-required',
  approved: 'bank-linked',
  'bank-linked': 'funded',
  funded: 'ready',
  ready: 'ready',
};

export const nextState = (state: AccountState): AccountState => NEXT_STATE[state];

function milestoneFor(state: AccountState) {
  if (state === 'approved') return 1;
  if (state === 'bank-linked') return 2;
  if (state === 'funded') return 3;
  if (state === 'ready') return 4;
  return 0;
}

function StatusPill({ state }: { state: AccountState }) {
  const item = CONTENT[state];
  const Icon = item.tone === 'danger' ? WarningCircle : item.tone === 'review' ? Clock : item.tone === 'success' ? CheckCircle : Sparkle;
  return <span className={s.statusPill} data-tone={item.tone}><Icon weight="fill" aria-hidden="true" />{STATES.find((option) => option.id === state)?.phase}</span>;
}

function StepCard({ index, state, onState }: { index: number; state: AccountState; onState: (value: AccountState) => void }) {
  const completed = milestoneFor(state) > index;
  const active = milestoneFor(state) === index && state !== 'ready';
  const flow = FLOW[index];
  const Icon = flow.icon;
  const item = CONTENT[state];

  if (!active) return (
    <article className={s.stepCard} data-complete={completed || undefined}>
      <span className={s.stepIcon}>{completed ? <Check weight="bold" aria-hidden="true" /> : <span>{index + 1}</span>}</span>
      <span>{flow.label}</span>
      {completed && <span className={s.completeBadge}>Completed</span>}
    </article>
  );

  return (
    <article className={s.stepCard} data-active data-tone={item.tone}>
      <span className={s.stepIcon}><Icon weight="regular" aria-hidden="true" /></span>
      <div className={s.stepBody}>
        <div className={s.stepTopline}><span>{flow.label}</span><StatusPill state={state} /></div>
        <h2>{item.title}</h2>
        <p>{item.body}</p>
        {state === 'verification-required' && <ul className={s.documentList}><li><Check weight="bold" aria-hidden="true" />Photo ID — driver’s license or passport</li><li><Check weight="bold" aria-hidden="true" />Proof of residency from the last 3 months</li></ul>}
        {state === 'documents-review' && <div className={s.receipt}><FileText weight="regular" aria-hidden="true" /><div><strong>Documents received</strong><span>Government-issued photo ID and proof of residency</span></div></div>}
        {state === 'documents-rejected' && <div className={s.rejectionNote}><WarningCircle weight="fill" aria-hidden="true" />The photo ID was too blurry to read. Upload a clear image with all four corners visible.</div>}
        {item.action && <button type="button" className={s.primaryAction} onClick={() => onState(nextState(state))}>{item.action}</button>}
      </div>
    </article>
  );
}

function ApplicationTimeline({ state }: { state: AccountState }) {
  const verified = !['submitted', 'verification-required', 'documents-review', 'documents-rejected'].includes(state);
  const rejected = state === 'documents-rejected';
  return <aside className={s.timelineCard}><p>Application timeline</p><ol>
    <li data-complete><span /><div><strong>Application submitted</strong><small>Aug 8, 2026</small></div></li>
    <li data-current={!verified || undefined} data-danger={rejected || undefined} data-complete={verified || undefined}><span /><div><strong>{rejected ? 'Verification unsuccessful' : verified ? 'Application approved' : state === 'verification-required' ? 'Further verification' : 'Review in progress'}</strong><small>{rejected || state === 'verification-required' ? 'Action needed' : verified ? 'Aug 11, 2026' : 'We’ll email you with an update'}</small></div></li>
    <li data-current={state === 'ready' || undefined} data-complete={state === 'ready' || undefined}><span /><div><strong>{state === 'ready' ? 'Ready to invest' : 'Account ready'}</strong><small>{state === 'ready' ? 'Your setup is complete' : 'Complete setup to unlock'}</small></div></li>
  </ol></aside>;
}

export function AccountSetupPreview({ state, onState }: { state: AccountState; onState: (value: AccountState) => void }) {
  return <div className={s.previewFrame}>
    <header className={s.previewHeader}><div className={s.brand}><img src="/assets/sidebar/logo-mark.svg" alt="" width="28" height="28" /><span>Surmount</span></div><span>Account setup preview</span></header>
    <main className={s.previewMain}>
      <div className={s.previewHero}><p>Surmount investing account</p><h1>{CONTENT[state].title}</h1><span>{CONTENT[state].body}</span></div>
      <div className={s.previewLayout}><section className={s.steps} aria-label="Account setup checklist">{FLOW.map((_, index) => <StepCard key={index} index={index} state={state} onState={onState} />)}</section><ApplicationTimeline state={state} /></div>
      <p className={s.support}>Questions? <a href="mailto:support@surmount.ai">support@surmount.ai</a></p>
    </main>
  </div>;
}
