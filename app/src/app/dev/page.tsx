'use client';

import Link from 'next/link';

const SECTIONS = [
  {
    label: 'Auth',
    routes: [
      { href: '/', label: 'Login' },
    ],
  },
  {
    label: 'Dashboard',
    routes: [
      { href: '/flow', label: 'Onboarding flow — visual map ★' },
      { href: '/onboarding-map', label: 'Onboarding map — flows, scenarios, edge cases ★' },
      { href: '/home', label: 'Investing home' },
      { href: '/home?state=empty&connected=kraken', label: 'Investing home — empty (just connected)' },
      { href: '/home/saving', label: 'Saving home' },
      { href: '/home/strategy/quantum-computing-leaders', label: 'Strategy detail' },
      { href: '/activity', label: 'Activity' },
      { href: '/strategy-result', label: 'Strategy result' },
    ],
  },
  {
    label: 'Playground',
    routes: [
      { href: '/home/playground/account-selection', label: 'Account selection — direction 1' },
      { href: '/home/playground/account-selection-1-2', label: 'Account selection — direction 1.1' },
      { href: '/home/playground/account-selection-2', label: 'Account selection — direction 2' },
      { href: '/home/playground/account-selection-2/account/ibkr', label: 'External account detail' },
      { href: '/home/playground/account-selection-2/account/surmount', label: 'Surmount brokerage account' },
      { href: '/home/playground/account-selection-2/account/surmount-hyca', label: 'High yield cash account prototype' },
    ],
  },
  {
    label: 'Onboarding — Start',
    routes: [
      { href: '/onboarding/welcome', label: 'Welcome (steps overview)' },
      { href: '/onboarding/about-you', label: 'About you' },
      { href: '/onboarding/start-investing', label: 'Start investing (choice)' },
      { href: '/onboarding/connect-brokerage', label: 'Connect brokerage' },
      { href: '/onboarding/brokerage-connected', label: 'Brokerage connected' },
    ],
  },
  {
    label: 'Onboarding — Identity & KYC',
    routes: [
      { href: '/onboarding/legal-name', label: 'Legal name' },
      { href: '/onboarding/date-of-birth', label: 'Date of birth' },
      { href: '/onboarding/phone', label: 'Phone' },
      { href: '/onboarding/verify-phone', label: 'Verify phone' },
      { href: '/onboarding/address', label: 'Address' },
      { href: '/onboarding/citizenship', label: 'Citizenship' },
      { href: '/onboarding/ssn', label: 'SSN' },
    ],
  },
  {
    label: 'Onboarding — Financial profile',
    routes: [
      { href: '/onboarding/employment', label: 'Employment' },
      { href: '/onboarding/occupation', label: 'Occupation' },
      { href: '/onboarding/annual-income', label: 'Annual income' },
      { href: '/onboarding/net-worth', label: 'Net worth' },
      { href: '/onboarding/financial-situation', label: 'Financial situation' },
      { href: '/onboarding/financial-goal', label: 'Financial goal' },
      { href: '/onboarding/risk-tolerance', label: 'Risk tolerance' },
      { href: '/onboarding/time-horizon', label: 'Time horizon' },
      { href: '/onboarding/investing-style', label: 'Investing style' },
    ],
  },
  {
    label: 'Onboarding — Strategy selection',
    routes: [
      { href: '/onboarding/strategy-quiz', label: 'Strategy quiz' },
      { href: '/onboarding/strategy-match', label: 'Strategy match' },
      { href: '/onboarding/strategy-results', label: 'Strategy results' },
      { href: '/onboarding/pick-strategy', label: 'Pick strategy' },
      { href: '/onboarding/portfolio-growth', label: 'Portfolio growth' },
      { href: '/onboarding/investment-allocation', label: 'Investment allocation' },
    ],
  },
  {
    label: 'Onboarding — Account setup',
    routes: [
      { href: '/onboarding/investing-account', label: 'Investing account' },
      { href: '/onboarding/account-setup', label: 'Account setup' },
      { href: '/onboarding/regulatory', label: 'Regulatory' },
      { href: '/onboarding/terms', label: 'Terms' },
      { href: '/onboarding/verify-documents', label: 'Verify documents' },
      { href: '/onboarding/documents-received', label: 'Documents received' },
    ],
  },
  {
    label: 'Onboarding — Application',
    routes: [
      { href: '/onboarding/application-loading', label: 'Application loading' },
      { href: '/onboarding/application-review', label: 'Application review' },
      { href: '/onboarding/application-submitted', label: 'Application submitted' },
      { href: '/onboarding/account-ready', label: 'Account ready' },
    ],
  },
  {
    label: 'Onboarding — Funding',
    routes: [
      { href: '/onboarding/funding-source', label: 'Funding source' },
      { href: '/onboarding/link-bank', label: 'Link bank' },
      { href: '/onboarding/bank-linked', label: 'Bank linked' },
      { href: '/onboarding/fund-account', label: 'Fund account' },
      { href: '/onboarding/fund-amount', label: 'Fund amount' },
      { href: '/onboarding/fund-deposit', label: 'Fund deposit' },
      { href: '/onboarding/fund-review', label: 'Fund review' },
      { href: '/onboarding/fund-success', label: 'Fund success' },
      { href: '/onboarding/cash-account', label: 'Cash account' },
    ],
  },
];

export default function DevIndex() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      padding: '48px 40px',
      fontFamily: 'var(--font-geist, Geist, sans-serif)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#181d27', margin: 0, letterSpacing: '-0.4px' }}>
            Surmount B2C — page directory
          </h1>
          <p style={{ fontSize: 13, color: '#717680', marginTop: 6, marginBottom: 0 }}>
            Dev-only. Navigate to any page in the app.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#a0a5ae',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                {section.label}
              </div>
              <div style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {section.routes.map((route, i) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 16px',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)',
                      textDecoration: 'none',
                      color: '#181d27',
                      fontSize: 14,
                      fontWeight: 400,
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{route.label}</span>
                    <span style={{ fontSize: 12, color: '#a0a5ae', fontFamily: 'monospace' }}>
                      {route.href}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
