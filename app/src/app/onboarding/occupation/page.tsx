'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSInput } from '../_components/DSInput';
import s from '../_components/onboarding.module.css';

export default function OccupationPage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleNext() {
    if (!value.trim()) { setError('Please enter your occupation.'); return; }
    router.push('/onboarding/annual-income');
  }

  return (
    <OnboardingFlow back="/onboarding/employment">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What&apos;s your occupation?</h1>
            <p className={s.subtitle}>Required by our broker partner for regulatory compliance.</p>
          </div>

          <div className={s.form}>
            <DSInput
              label="Occupation"
              id="occupation"
              type="text"
              placeholder="e.g. Software engineer"
              autoFocus
              value={value}
              error={!!error}
              errorText={error || undefined}
              onChange={e => { setValue(e.target.value); if (error) setError(''); }}
            />
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
