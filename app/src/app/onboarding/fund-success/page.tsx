'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import OnboardingFlow from '../_components/OnboardingFlow';
import Brand from '../_components/Brand';
import s from './page.module.css';

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
};

const rowBaseline: React.CSSProperties = {
  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16,
};

const label: React.CSSProperties = {
  fontSize: 16, fontWeight: 500, lineHeight: '24px',
  color: 'var(--color-fg-primary-900)',
  fontFamily: 'var(--font-family-body)',
};

const value: React.CSSProperties = {
  fontSize: 16, fontWeight: 400, lineHeight: '24px',
  color: 'var(--color-fg-secondary-700)',
  textAlign: 'right',
  fontFamily: 'var(--font-family-body)',
};

const secDivided: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 12,
  borderTop: '1px solid var(--color-border-secondary)',
  paddingTop: 20, marginTop: 20,
};

const avatar: React.CSSProperties = {
  width: 24, height: 24, borderRadius: '50%',
  overflow: 'hidden', flexShrink: 0,
  border: '0.5px solid rgba(0,0,0,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function FundSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();

  const rawAmount = parseInt(params.get('amount') ?? '0');
  const freq      = params.get('freq') ?? 'Once';
  const starts    = params.get('starts');
  const dateLabel = starts ? `Starts ${starts}` : 'Today';
  const amountLabel = rawAmount > 0
    ? `$${rawAmount.toLocaleString()}.00 USD`
    : '$1,000.00 USD';

  const [timestamp,   setTimestamp]   = useState('Today');
  const [confirmCode, setConfirmCode] = useState('SM-······');

  useEffect(() => {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    setTimestamp(`Today at ${h}:${m} ${ampm}`);

    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let id = 'SM-';
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    setConfirmCode(id);
  }, []);

  return (
    <OnboardingFlow showExitModal={false}>
      <main style={{
        flex: 1,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Card */}
          <div style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 21px 24px',
            boxShadow: '0 2px 12px rgba(10,13,18,0.03)',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}>

            {/* Hero */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', paddingBottom: 4 }}>
              <span
                className={s.icon}
                aria-hidden="true"
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  border: '2px solid #3b7e3f',
                  background: '#eef7ee',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#3b7e3f',
                  marginBottom: 8,
                }}
              >
                <svg viewBox="0 0 32 32" style={{ width: 36, height: 36 }} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline className={s.checkStroke} points="8 16.5 14 22.5 24 11.5"/>
                </svg>
              </span>

              <h1 className={s.title} style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 24, fontWeight: 500,
                lineHeight: '32px', letterSpacing: '-0.4px',
                color: 'var(--color-fg-primary-900)',
              }}>
                Transfer submitted
              </h1>

              <p className={s.timestamp} style={{
                fontSize: 16, fontWeight: 400, lineHeight: '24px',
                color: 'var(--color-fg-tertiary-600)',
                fontFamily: 'var(--font-family-body)',
              }}>
                {timestamp}
              </p>
            </div>

            {/* Section 1: From / To */}
            <div className={s.section1} style={secDivided}>
              <div style={row}>
                <span style={label}>From</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...avatar, background: 'rgba(17,122,202,0.08)' }}>
                    <Image src="/assets/illustrations/bank-chase.png" alt="Chase" width={16} height={16} style={{ objectFit: 'contain' }} />
                  </span>
                  <span style={value}>Chase ••••4721</span>
                </span>
              </div>
              <div style={row}>
                <span style={label}>To</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={avatar}><Brand size={24} /></span>
                  <span style={value}>Surmount brokerage</span>
                </span>
              </div>
            </div>

            {/* Section 2: Frequency / Date / Processing time */}
            <div className={s.section2} style={secDivided}>
              <div style={rowBaseline}>
                <span style={label}>Frequency</span>
                <span style={value}>{freq}</span>
              </div>
              <div style={rowBaseline}>
                <span style={label}>Date</span>
                <span style={value}>{dateLabel}</span>
              </div>
              <div style={rowBaseline}>
                <span style={label}>Processing time</span>
                <span style={value}>1–4 business days</span>
              </div>
            </div>

            {/* Section 3: Amount */}
            <div className={s.section3} style={secDivided}>
              <div style={rowBaseline}>
                <span style={label}>Amount</span>
                <span style={{ ...value, fontWeight: 500, color: 'var(--color-fg-primary-900)' }}>{amountLabel}</span>
              </div>
            </div>

            {/* Section 4: Confirmation */}
            <div className={s.section4} style={secDivided}>
              <div style={rowBaseline}>
                <span style={label}>Confirmation</span>
                <span style={{ ...value, fontFamily: 'var(--font-family-display)', letterSpacing: '-0.2px' }}>
                  {confirmCode}
                </span>
              </div>
            </div>

          </div>

          {/* Done */}
          <button
            type="button"
            className={s.doneBtn}
            onClick={() => router.push('/home')}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'var(--color-fg-primary-900)',
              border: '2px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 500, letterSpacing: '-0.2px',
              color: '#fff', cursor: 'pointer',
              transition: 'background 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#252b37')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-fg-primary-900)')}
          >
            Done
          </button>

        </div>
      </main>
    </OnboardingFlow>
  );
}

export default function FundSuccessPage() {
  return (
    <Suspense>
      <FundSuccessContent />
    </Suspense>
  );
}
