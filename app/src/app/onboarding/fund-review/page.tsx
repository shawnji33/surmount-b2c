'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import OnboardingFlow from '../_components/OnboardingFlow';
import Brand from '../_components/Brand';

const backBtn: React.CSSProperties = {
  alignSelf: 'flex-start', width: 40, height: 40,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border-primary)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-fg-tertiary-600)',
  cursor: 'pointer', flexShrink: 0,
  transition: 'background 150ms ease',
};

const sec: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 12,
};

const secDivided: React.CSSProperties = {
  ...sec,
  borderTop: '1px solid var(--color-border-secondary)',
  paddingTop: 20, marginTop: 20,
};

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

const avatar: React.CSSProperties = {
  width: 24, height: 24, borderRadius: '50%',
  overflow: 'hidden', flexShrink: 0,
  border: '0.5px solid rgba(0,0,0,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function FundReviewContent() {
  const router = useRouter();
  const params = useSearchParams();

  const rawAmount = parseInt(params.get('amount') ?? '0');
  const freq      = params.get('freq') ?? 'Once';
  const starts    = params.get('starts'); // e.g. "May 20" or null
  const dateLabel = starts ? `Starts ${starts}` : 'Today';
  const amountLabel = rawAmount > 0
    ? `$${rawAmount.toLocaleString()}.00 USD`
    : '$1,000.00 USD';

  function buildSuccessParams() {
    const p = new URLSearchParams();
    p.set('amount', rawAmount.toString());
    p.set('freq', freq);
    if (starts) p.set('starts', starts);
    return p.toString();
  }

  return (
    <OnboardingFlow>
      <main style={{
        flex: 1,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Back */}
          <button type="button" onClick={() => router.back()} aria-label="Back" style={backBtn}>
            <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }} aria-hidden="true">
              <line x1="216" y1="128" x2="40" y2="128"/>
              <polyline points="112 56 40 128 112 200"/>
            </svg>
          </button>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 24, fontWeight: 500,
            lineHeight: '32px', letterSpacing: '-0.4px',
            color: 'var(--color-fg-primary-900)',
          }}>
            Review your deposit
          </h1>

          {/* Card */}
          <div style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 21px',
            boxShadow: '0 2px 12px rgba(10,13,18,0.03)',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}>

            {/* Section 1: From / To */}
            <div style={sec}>
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
            <div style={secDivided}>
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
            <div style={secDivided}>
              <div style={rowBaseline}>
                <span style={label}>Amount</span>
                <span style={{ ...value, fontWeight: 500, color: 'var(--color-fg-primary-900)' }}>{amountLabel}</span>
              </div>
            </div>

          </div>

          {/* Disclaimer */}
          <p style={{
            fontSize: 14, fontWeight: 400, lineHeight: '20px',
            color: 'var(--color-fg-tertiary-600)',
            fontFamily: 'var(--font-family-body)',
          }}>
            By confirming, you authorize Surmount to initiate this transfer. Funds may take 1–4 business days to settle.
          </p>

          {/* Confirm */}
          <button
            type="button"
            onClick={() => router.push(`/onboarding/fund-success?${buildSuccessParams()}`)}
            style={{
              width: '100%', padding: '10px 16px',
              background: 'var(--color-fg-primary-900)',
              border: '2px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 500, letterSpacing: '-0.2px',
              color: '#fff', cursor: 'pointer',
              transition: 'background 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#252b37')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-fg-primary-900)')}
          >
            Confirm deposit
            <svg viewBox="0 0 256 256" fill="currentColor" style={{ width: 16, height: 16 }} aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </button>

        </div>
      </main>
    </OnboardingFlow>
  );
}

export default function FundReviewPage() {
  return (
    <Suspense>
      <FundReviewContent />
    </Suspense>
  );
}
