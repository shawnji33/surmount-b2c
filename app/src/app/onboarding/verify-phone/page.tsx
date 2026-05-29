'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '../_components/OnboardingFlow';
import s from '../_components/onboarding.module.css';

export default function VerifyPhonePage() {
  const router = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [hasError, setHasError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState('');
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => { refs[0].current?.focus(); }, []);

  function handleInput(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setHasError(false);
    if (d && i < 5) refs[i + 1].current?.focus();
    if (next.every(c => c)) {
      const code = next.join('');
      setTimeout(() => {
        if (code === '000000') {
          setHasError(true);
          setDigits(['', '', '', '', '', '']);
          refs[0].current?.focus();
        } else {
          router.push('/onboarding/employment');
        }
      }, 350);
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
      const next = [...digits]; next[i - 1] = '';
      setDigits(next);
    } else if (e.key === 'ArrowLeft' && i > 0) refs[i - 1].current?.focus();
    else if (e.key === 'ArrowRight' && i < 5) refs[i + 1].current?.focus();
  }

  function handlePaste(e: React.ClipboardEvent, i: number) {
    const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - i);
    if (!raw) return;
    e.preventDefault();
    const next = [...digits];
    raw.split('').forEach((d, k) => { if (i + k < 6) next[i + k] = d; });
    setDigits(next);
    const last = Math.min(i + raw.length, 5);
    refs[last].current?.focus();
    if (next.every(c => c)) {
      setTimeout(() => {
        const code = next.join('');
        if (code === '000000') {
          setHasError(true);
          setDigits(['', '', '', '', '', '']);
          refs[0].current?.focus();
        } else {
          router.push('/onboarding/employment');
        }
      }, 350);
    }
  }

  function handleResend() {
    if (cooldown) return;
    setCooldown(30);
    setResendMsg('Code sent. Resend available in 30s.');
    const tick = (n: number) => {
      setTimeout(() => {
        if (n <= 1) { setCooldown(0); setResendMsg(''); return; }
        setCooldown(n - 1);
        setResendMsg(`Resend available in ${n - 1}s.`);
        tick(n - 1);
      }, 1000);
    };
    tick(30);
  }

  return (
    <OnboardingFlow back="/onboarding/phone">
      <main className={s.main}>
        <div className={s.stack}>
          <span className={s.iconFrame} aria-hidden="true">
            <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
              <rect x="64" y="24" width="128" height="208" rx="16"/>
              <line x1="112" y1="64" x2="144" y2="64"/>
            </svg>
          </span>

          <div className={s.hero}>
            <h1 className={s.title}>Check your texts</h1>
            <p className={s.subtitle}>Enter the code sent to <strong style={{ color: 'var(--color-fg-primary-900)' }}>(•••) ••• ••79</strong></p>
          </div>

          <div className={s.otpGroup} role="group" aria-label="Verification code">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                className={`${s.otpCell} ${d ? s.otpCellFilled : ''} ${hasError ? s.otpCellError : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1} of 6`}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                value={d}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e => e.target.select()}
                onPaste={e => handlePaste(e, i)}
              />
            ))}
          </div>

          {hasError && (
            <div className={s.otpError} role="alert">
              <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="128" cy="128" r="96"/>
                <line x1="128" y1="80" x2="128" y2="136"/>
                <circle cx="128" cy="172" r="12" fill="currentColor" stroke="none"/>
              </svg>
              Incorrect code. Please try again.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <button
              className={s.resendBtn}
              type="button"
              disabled={!!cooldown}
              onClick={handleResend}
            >
              Resend code
            </button>
            {resendMsg && <span className={s.resendStatus}>{resendMsg}</span>}
          </div>
        </div>
      </main>
    </OnboardingFlow>
  );
}
