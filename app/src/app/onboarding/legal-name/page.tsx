'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSInput } from '../_components/DSInput';
import s from '../_components/onboarding.module.css';

export default function LegalNamePage() {
  const router = useRouter();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [errors, setErrors] = useState({ first: '', last: '' });

  function handleNext() {
    const e = {
      first: first.trim() ? '' : 'First name is required.',
      last: last.trim() ? '' : 'Last name is required.',
    };
    setErrors(e);
    if (!e.first && !e.last) router.push('/onboarding/date-of-birth');
  }

  return (
    <OnboardingFlow back="/onboarding/investing-account">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What&apos;s your legal name?</h1>
            <p className={s.subtitle}>Enter your name exactly as it appears on your government-issued ID.</p>
          </div>

          <div className={s.form}>
            <div className={s.fieldRow}>
              <DSInput
                label="First name"
                id="first-name"
                type="text"
                placeholder="Jane"
                autoComplete="given-name"
                autoFocus
                value={first}
                error={!!errors.first}
                errorText={errors.first || undefined}
                onChange={e => { setFirst(e.target.value); if (errors.first) setErrors(p => ({ ...p, first: '' })); }}
              />
              <DSInput
                label="Last name"
                id="last-name"
                type="text"
                placeholder="Smith"
                autoComplete="family-name"
                value={last}
                error={!!errors.last}
                errorText={errors.last || undefined}
                onChange={e => { setLast(e.target.value); if (errors.last) setErrors(p => ({ ...p, last: '' })); }}
              />
            </div>
          </div>

          <button className={s.cta} type="button" onClick={handleNext}>
            Next
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>
        </div>
      </main>
    </OnboardingFlow>
  );
}
