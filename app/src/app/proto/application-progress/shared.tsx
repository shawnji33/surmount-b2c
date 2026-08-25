'use client';

import {
  Bank,
  Check,
  CheckCircle,
  Clock,
  CurrencyDollar,
  FileText,
  ShieldCheck,
  Sparkle,
  WarningCircle,
} from '@phosphor-icons/react';
import s from './page.module.css';

export const STATES = [
  { id: 'application-review', label: 'Application review', tone: 'review' },
  { id: 'verify-identity', label: 'Verify identity', tone: 'action' },
  { id: 'documents-review', label: 'Documents review', tone: 'review' },
  { id: 'link-bank', label: 'Connect bank', tone: 'action' },
  { id: 'first-deposit', label: 'First deposit', tone: 'action' },
  { id: 'pick-strategy', label: 'Pick strategy', tone: 'action' },
  { id: 'rejected', label: 'Rejected', tone: 'danger' },
] as const;

export type ApplicationState = (typeof STATES)[number]['id'];

export function nextState(state: ApplicationState): ApplicationState | null {
  return ({
    'application-review': 'link-bank',
    'verify-identity': 'documents-review',
    'documents-review': 'application-review',
    'link-bank': 'first-deposit',
    'first-deposit': 'pick-strategy',
    'pick-strategy': 'application-review',
    'rejected': null,
  } as Record<ApplicationState, ApplicationState | null>)[state];
}

export function StateSwitch({ value, onChange }: { value: ApplicationState; onChange: (state: ApplicationState) => void }) {
  return (
    <div className={s.stateSwitcher} aria-label="Preview application state">
      <span>Preview state</span>
      <div className={s.stateOptions} role="group" aria-label="Application state">
        {STATES.map((state) => (
          <button
            type="button"
            key={state.id}
            data-active={value === state.id || undefined}
            data-tone={state.tone}
            aria-pressed={value === state.id}
            onClick={() => onChange(state.id)}
          >
            {state.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatePill({ state }: { state: ApplicationState }) {
  const config = STATES.find((item) => item.id === state)!;
  const Icon = config.tone === 'danger' ? WarningCircle : config.tone === 'action' ? Sparkle : Clock;
  return <span className={s.statePill} data-tone={config.tone}><Icon weight="fill" aria-hidden="true" />{config.label}</span>;
}

export function FlowRail({ state }: { state: ApplicationState }) {
  const activeStep = state === 'link-bank' ? 1 : state === 'first-deposit' ? 2 : state === 'pick-strategy' ? 3 : 0;
  const steps = [
    { label: 'Submit your application', icon: ShieldCheck },
    { label: 'Connect your bank', icon: Bank },
    { label: 'Make your first deposit', icon: CurrencyDollar },
    { label: 'Pick your first strategy', icon: Sparkle },
  ];

  return (
    <ol className={s.flowRail} aria-label="Application milestones">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const complete = state !== 'rejected' && index < activeStep;
        const active = state !== 'rejected' && index === activeStep;
        return (
          <li key={step.label} data-complete={complete || undefined} data-active={active || undefined}>
            <span className={s.flowRailMarker}>{complete ? <Check weight="bold" aria-hidden="true" /> : <Icon weight="regular" aria-hidden="true" />}</span>
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function DocumentReceipt() {
  return (
    <div className={s.documentReceipt}>
      <div className={s.receiptHeading}>
        <span className={s.receiptIcon}><FileText weight="regular" aria-hidden="true" /></span>
        <div><strong>Identity documents received</strong><span>Submitted Mar 4, 2026 at 10:42 AM ET</span></div>
      </div>
      <ul>
        <li><CheckCircle weight="fill" aria-hidden="true" />Government-issued photo ID</li>
        <li><CheckCircle weight="fill" aria-hidden="true" />Proof of residential address</li>
      </ul>
    </div>
  );
}

export function StateCopy({ state }: { state: ApplicationState }) {
  const content: Record<ApplicationState, { title: string; body: string; cta: string }> = {
    'application-review': { title: 'Your application is under review', body: 'We have everything we need. Most applications are reviewed within 1–2 business days.', cta: 'View review details' },
    'verify-identity': { title: 'Verify your identity', body: 'Upload a government-issued photo ID and proof of your residential address to keep your application moving.', cta: 'Upload documents' },
    'documents-review': { title: 'Your documents are under review', body: 'We are checking the documents you submitted. We’ll email you as soon as your application can continue.', cta: 'Review submission' },
    'link-bank': { title: 'Connect a bank account', body: 'Link a bank to securely move money into your Surmount investing account.', cta: 'Connect bank' },
    'first-deposit': { title: 'Make your first deposit', body: 'Your bank is connected. Add funds whenever you’re ready—there is no minimum deposit.', cta: 'Make a deposit' },
    'pick-strategy': { title: 'Pick your first strategy', body: 'Your account is funded. Choose a strategy to put your first dollars to work.', cta: 'Explore strategies' },
    'rejected': { title: 'We couldn’t approve your application', body: 'Your application can’t move forward at this time. Our support team can help clarify next steps.', cta: 'Email support' },
  };
  const item = content[state];
  return <><h2>{item.title}</h2><p>{item.body}</p><span className={s.stateCtaLabel}>{item.cta}</span></>;
}
