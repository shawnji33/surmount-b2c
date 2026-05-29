'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSDatePicker } from '../_components/DSDatePicker';
import s from '../_components/onboarding.module.css';

export default function DateOfBirthPage() {
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);

  return (
    <OnboardingFlow back="/onboarding/legal-name">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What is your date of birth?</h1>
            <p className={s.subtitle}>You must be 18 or older to open an account.</p>
          </div>

          <div className={s.form}>
            <DSDatePicker
              label="Date of birth"
              id="dob"
              onValueChange={(v) => setIsValid(!!v)}
            />
          </div>

          <button
            className={s.cta}
            type="button"
            disabled={!isValid}
            onClick={() => router.push('/onboarding/address')}
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
