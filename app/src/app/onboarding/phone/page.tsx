'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSInput } from '../_components/DSInput';
import s from '../_components/onboarding.module.css';

function maskPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  function handleSend() {
    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit US phone number.');
      return;
    }
    router.push('/onboarding/verify-phone');
  }

  return (
    <OnboardingFlow back="/onboarding/ssn">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What&apos;s your phone number?</h1>
            <p className={s.subtitle}>We&apos;ll send you a verification code.</p>
          </div>

          <div className={s.form}>
            <DSInput
              label="Phone number"
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="(555) 000-0000"
              autoFocus
              autoComplete="tel-national"
              value={phone}
              error={!!error}
              errorText={error || undefined}
              onChange={e => { setPhone(maskPhone(e.target.value)); if (error) setError(''); }}
              phonePrefix
              helperText={error ? undefined : 'US phone numbers only'}
            />
          </div>

          <button className={s.cta} type="button" onClick={handleSend}>
            Send code
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>
        </div>
      </main>
    </OnboardingFlow>
  );
}
