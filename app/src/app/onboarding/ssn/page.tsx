'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import { DSInput } from '../_components/DSInput';
import s from '../_components/onboarding.module.css';

function maskSSN(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export default function SSNPage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const rawDigits = value.replace(/\D/g, '');

  function handleNext() {
    if (rawDigits.length !== 9) {
      setError('Please enter your full 9-digit Social Security number.');
      return;
    }
    router.push('/onboarding/phone');
  }

  return (
    <OnboardingFlow back="/onboarding/citizenship">
      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>What is your Social Security number?</h1>
            <p className={s.subtitle}>Required by federal law for identity verification.</p>
          </div>

          <div className={s.form}>
            <DSInput
              label="Social Security number"
              id="ssn"
              type={show ? 'text' : 'password'}
              inputMode="numeric"
              placeholder="•••-••-••••"
              autoFocus
              autoComplete="off"
              value={value}
              error={!!error}
              errorText={error || undefined}
              onChange={e => { setValue(maskSSN(e.target.value)); if (error) setError(''); }}
              iconTrailing={
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', alignItems: 'center' }}
                  aria-label={show ? 'Hide SSN' : 'Show SSN'}
                >
                  {show ? (
                    <svg width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M201.15 133.27C208.92 124.45 216 113.38 216 128s-88 120-88 0"/>
                      <line x1="201.15" y1="54.85" x2="54.85" y2="201.15"/>
                      <path d="M128 56c-12.29 0-23.6 3.82-34.41 9.31"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M128 56C48 56 16 128 16 128s32 72 112 72 112-72 112-72S208 56 128 56Z"/>
                      <circle cx="128" cy="128" r="40"/>
                    </svg>
                  )}
                </button>
              }
            />

            <div className={s.securityNote}>
              <svg className={s.securityNoteIcon} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M40 114.79V56a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8v58.77c0 84.18-71.31 112.47-88.6 118.41a15.53 15.53 0 0 1-10.8 0C99.31 227.26 40 199 40 114.79Z"/>
                <polyline points="88 136 112 160 168 104"/>
              </svg>
              <div className={s.securityNoteBody}>
                <p className={s.securityNoteTitle}>Your SSN confirms your identity</p>
                <p className={s.securityNoteText}>We use 256-bit encryption and bank-level security to protect your data.</p>
              </div>
            </div>
          </div>

          <button
            className={s.cta}
            type="button"
            onClick={handleNext}
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
