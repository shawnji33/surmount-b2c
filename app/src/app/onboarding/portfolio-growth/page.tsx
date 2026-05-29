import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function PortfolioGrowthPage() {
  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <Link href="/onboarding/strategy-results" className={s.topbarBtn}>
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="216" y1="128" x2="40" y2="128"/>
            <polyline points="112 56 40 128 112 200"/>
          </svg>
          Back
        </Link>
        <div className={s.topbarBrand}>
          <img src="https://www.figma.com/api/mcp/asset/3bbd6119-7028-47e5-9a7d-d4fafba87569" alt="" className={s.topbarBrandIcon} />
          <img src="https://www.figma.com/api/mcp/asset/3297adb2-a615-459c-b3a1-30442b03c519" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <Link href="/home" className={s.topbarBtn}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </Link>
      </header>

      <main className={s.main}>
        <div className={s.stack}>
          <div className={s.hero}>
            <h1 className={s.title}>Your projected portfolio growth</h1>
            <p className={s.subtitle}>Based on the Quantum Computing Leaders strategy with a $5,000 initial investment.</p>
          </div>

          <div style={{ width: '100%', padding: '20px', background: '#fff', border: '1px solid rgba(0,0,0,0.086)', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              {[
                { label: '1 year', value: '$6,420' },
                { label: '3 years', value: '$12,115' },
                { label: '5 years', value: '$19,840' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.5px', color: 'var(--color-fg-primary-900)', fontFamily: 'var(--font-family-display)' }}>{item.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-fg-tertiary-600)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            {/* Simple chart placeholder */}
            <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pg-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,70 C60,65 100,50 160,35 C220,20 280,10 400,5 L400,80 L0,80 Z" fill="url(#pg-fill)"/>
              <path d="M0,70 C60,65 100,50 160,35 C220,20 280,10 400,5" fill="none" stroke="#10b981" strokeWidth="2"/>
            </svg>
            <p style={{ fontSize: 12, fontWeight: 400, color: 'rgba(10,13,18,0.4)', textAlign: 'center', marginTop: 8 }}>Projected based on historical performance. Past performance doesn&apos;t guarantee future results.</p>
          </div>

          <Link href="/onboarding/link-bank" className={s.cta} style={{ textDecoration: 'none' }}>
            Fund my account
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
