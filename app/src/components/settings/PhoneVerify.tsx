'use client';

import { Button } from '@/components/Button';
import { ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import s from '../SettingsModal.module.css';
import { COUNTRIES, OtpInput, type Country } from './OtpInput';

type Stage = 'idle' | 'otp' | 'verified';

export function PhoneVerify({
  initialPhone = '',
  initialCountry = COUNTRIES[0],
  startVerified = false,
}: {
  initialPhone?: string;
  initialCountry?: Country;
  startVerified?: boolean;
}) {
  const [country, setCountry] = useState<Country>(initialCountry);
  const [phone, setPhone] = useState(initialPhone);
  const [stage, setStage] = useState<Stage>(startVerified ? 'verified' : 'idle');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  function handleGetCode(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setPhoneError('Enter a valid phone number.');
      return;
    }
    setPhoneError('');
    setOtp('');
    setOtpError('');
    setStage('otp');
  }

  function handleVerify() {
    if (otp.length < 6) {
      setOtpError('Enter the 6-digit code.');
      return;
    }
    setOtpError('');
    setStage('verified');
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    setPhoneError('');
    // Editing a verified number requires re-verification.
    if (stage === 'verified') setStage('idle');
  }

  return (
    <div className={s.phoneVerify}>
      <form className={s.phoneRow} onSubmit={handleGetCode}>
        <div className={[s.phoneField, phoneError ? s.phoneFieldError : ''].filter(Boolean).join(' ')}>
          <select
            className={s.countrySelect}
            aria-label="Country code"
            value={country.code}
            onChange={(e) => setCountry(COUNTRIES.find((c) => c.code === e.target.value) ?? COUNTRIES[0])}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.dial}
              </option>
            ))}
          </select>
          <span className={s.phoneDivider} aria-hidden="true" />
          <input
            className={s.phoneInput}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 000-0000"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
        </div>
        {stage === 'verified' ? (
          <span className={s.enabledTag}>
            <CheckCircle weight="fill" aria-hidden="true" />
            Verified
          </span>
        ) : (
          <Button type="submit" variant="secondary" size="sm" fullWidth={false}>
            Get verification
          </Button>
        )}
      </form>
      {phoneError && <span className={s.fieldError}>{phoneError}</span>}

      {stage === 'otp' && (
        <div className={s.otpReveal}>
          <span className={s.twoFaBlockLabel}>
            Enter the 6-digit code sent to {country.dial} ••• {phone.slice(-4) || '0000'}.
          </span>
          <div className={s.otpRow}>
            <OtpInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                setOtpError('');
              }}
              onComplete={handleVerify}
              invalid={Boolean(otpError)}
            />
            <Button type="button" onClick={handleVerify} size="sm" fullWidth={false}>
              Verify
            </Button>
          </div>
          {otpError && <span className={s.fieldError}>{otpError}</span>}
          <button type="button" className={s.resendBtn} onClick={() => setOtp('')}>
            <ArrowCounterClockwise weight="regular" aria-hidden="true" />
            Resend code
          </button>
        </div>
      )}
    </div>
  );
}
