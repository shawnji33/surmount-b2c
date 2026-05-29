'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

const OPTIONS = [
  { value: 'grow-wealth', label: 'Grow wealth', sub: 'Long-term capital appreciation' },
  { value: 'retirement', label: 'Retire comfortably', sub: 'Build a retirement nest egg' },
  { value: 'income', label: 'Generate income', sub: 'Dividends and regular distributions' },
  { value: 'save-goal', label: 'Save for a goal', sub: 'House, education, or other milestone' },
  { value: 'preserve', label: 'Preserve capital', sub: 'Protect what I have with modest growth' },
];

export default function FinancialGoalPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  return (
    <OnboardingFlow back="/onboarding/investing-style">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What&apos;s your primary financial goal?</h1>
          </div>

          <div className={s.radioGroup} role="radiogroup" aria-label="Primary financial goal">
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
                <div>
                  <div className={s.radioText}>{opt.label}</div>
                  <div className={s.radioSubtext}>{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            className={s.cta}
            type="button"
            disabled={!selected}
            onClick={() => router.push('/onboarding/financial-situation')}
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
