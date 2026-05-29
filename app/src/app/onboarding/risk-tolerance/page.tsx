'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

const OPTIONS = [
  { value: 'conservative', label: 'Conservative', sub: 'Prioritize protecting my capital' },
  { value: 'moderate', label: 'Moderate', sub: 'Balance growth and stability' },
  { value: 'aggressive', label: 'Aggressive', sub: 'Maximize growth, accept higher swings' },
];

export default function RiskTolerancePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  return (
    <OnboardingFlow back="/onboarding/time-horizon">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What&apos;s your risk tolerance?</h1>
            <p className={s.subtitle}>How comfortable are you with portfolio volatility?</p>
          </div>

          <div className={s.radioGroup} role="radiogroup" aria-label="Risk tolerance">
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
            onClick={() => router.push('/onboarding/investment-allocation')}
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
