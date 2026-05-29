'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

const OPTIONS = [
  { value: 'us-citizen', label: 'US citizen' },
  { value: 'permanent-resident', label: 'Permanent resident (green card)' },
  { value: 'visa-holder', label: 'Visa holder' },
  { value: 'not-us-citizen', label: 'Not a US citizen' },
];

export default function CitizenshipPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  return (
    <OnboardingFlow back="/onboarding/address">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What&apos;s your citizenship status?</h1>
          </div>

          <div className={s.radioGroup} role="radiogroup" aria-label="Citizenship status">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected === opt.value}
                className={`${s.radioRow} ${selected === opt.value ? s.radioRowSelected : ''}`}
                onClick={() => setSelected(opt.value)}
              >
                <span className={`${s.radioIndicator} ${selected === opt.value ? s.radioIndicatorSelected : ''}`} />
                <span className={s.radioText}>{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            className={s.cta}
            type="button"
            disabled={!selected}
            onClick={() => router.push('/onboarding/ssn')}
          >
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
