'use client';

import { Button } from '@/components/Button';
import { ArrowCounterClockwise, CheckCircle, FileArrowUp, ShieldCheck } from '@phosphor-icons/react';
import { useState } from 'react';
import s from '../SettingsModal.module.css';
import { COUNTRIES, OtpInput } from './OtpInput';
import { PasswordModal } from './PasswordModal';

// Flip to a non-empty list to render the upload state instead of the empty state.
const REQUIRED_DOCUMENTS: { id: string; label: string }[] = [];

type TwoFaStage = 'off' | 'phone' | 'otp' | 'on';

export function PrivacyPanel() {
  const [stage, setStage] = useState<TwoFaStage>('off');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [hasPassword, setHasPassword] = useState(true);
  const [pwOpen, setPwOpen] = useState(false);

  const maskedPhone = `${country.dial} ••• ${phone.slice(-4)}`;

  function handleToggle(next: boolean) {
    if (next) {
      setStage('phone');
    } else {
      setStage('off');
      setPhone('');
      setOtp('');
      setPhoneError('');
      setOtpError('');
    }
  }

  function handleSavePhone(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setPhoneError('Enter a valid phone number.');
      return;
    }
    setPhoneError('');
    setStage('otp');
  }

  function handleVerify() {
    if (otp.length < 6) {
      setOtpError('Enter the 6-digit code.');
      return;
    }
    setOtpError('');
    setStage('on');
  }

  return (
    <div className={s.panel}>
      {/* Security — two-factor authentication + password combined */}
      <div className={s.section}>
        {/* 2FA row */}
        <div className={s.settingRow}>
          <div className={s.settingText}>
            <span className={s.settingTitle}>Two-factor authentication (2FA)</span>
            <span className={s.settingSub}>Keep your account secure by enabling 2FA via SMS.</span>
          </div>
          <div className={s.settingControl}>
            <SettingToggle on={stage !== 'off'} onChange={handleToggle} />
          </div>
        </div>

        {/* Phone capture */}
        {stage === 'phone' && (
          <form className={s.twoFaBlock} onSubmit={handleSavePhone}>
            <span className={s.twoFaBlockLabel}>Verify your phone number to enable SMS authentication.</span>
            <div className={s.phoneRow}>
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
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError('');
                  }}
                />
              </div>
              <Button type="submit" size="sm" fullWidth={false}>Send code</Button>
            </div>
            {phoneError && <span className={s.fieldError}>{phoneError}</span>}
          </form>
        )}

        {/* OTP verification */}
        {stage === 'otp' && (
          <div className={s.twoFaBlock}>
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

        {/* Enabled summary */}
        {stage === 'on' && (
          <div className={s.twoFaBlock}>
            <div className={s.twoFaEnabledRow}>
              <ShieldCheck className={s.twoFaEnabledIcon} weight="fill" aria-hidden="true" />
              <div className={s.settingText}>
                <span className={s.settingTitle}>SMS authentication is on</span>
                <span className={s.settingSub}>Codes are sent to {maskedPhone}.</span>
              </div>
              <button type="button" className={s.linkBtn} onClick={() => setStage('phone')}>
                Change number
              </button>
            </div>
          </div>
        )}

        <div className={s.rowDivider} />

        {/* Password row */}
        <div className={s.settingRow}>
          <div className={s.settingText}>
            <span className={s.settingTitle}>Password</span>
            <span className={s.settingSub}>Set a unique password to protect your Surmount account.</span>
          </div>
          <div className={s.settingControl}>
            <Button type="button" variant="secondary" size="sm" fullWidth={false} onClick={() => setPwOpen(true)}>
              {hasPassword ? 'Change password' : 'Set password'}
            </Button>
          </div>
        </div>
      </div>

      <div className={s.divider} />

      {/* Required documents */}
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Required documents</h3>
        <p className={s.sectionDesc}>Documents we may need to keep your account verified and compliant.</p>

        {REQUIRED_DOCUMENTS.length === 0 ? (
          <div className={s.emptyDocs}>
            <CheckCircle className={s.emptyDocsIcon} weight="regular" aria-hidden="true" />
            <span>No specific documents are required at this time.</span>
          </div>
        ) : (
          REQUIRED_DOCUMENTS.map((doc) => (
            <div className={s.settingRow} key={doc.id}>
              <div className={s.settingText}>
                <span className={s.settingTitle}>{doc.label}</span>
                <span className={s.settingSub}>Action required</span>
              </div>
              <div className={s.settingControl}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  iconLeading={<FileArrowUp weight="regular" aria-hidden="true" />}
                >
                  Upload document
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {pwOpen && (
        <PasswordModal
          hasExistingPassword={hasPassword}
          onClose={() => setPwOpen(false)}
          onSaved={() => setHasPassword(true)}
        />
      )}
    </div>
  );
}

function SettingToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[s.toggle, on ? s.toggleOn : ''].filter(Boolean).join(' ')}
    >
      <span className={s.toggleThumb} />
    </button>
  );
}

