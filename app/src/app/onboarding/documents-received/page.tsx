import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function DocumentsReceivedPage() {
  return (
    <div className={s.docsReceivedPage}>
      <header className={s.docsReceivedTopbar}>
        <Link href="/home" className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </Link>
      </header>

      <main className={s.docsReceivedMain}>
        <div className={s.docsReceivedContent}>
          <span className={s.docsStatusPill}>
            <span className={s.docsStatusPillDot} aria-hidden="true" />
            Documents under review
          </span>

          <div className={s.docsReceivedHero}>
            <h1 className={s.docsReceivedTitle}>Thanks, Shawn</h1>
            <p className={s.docsReceivedSubtitle}>
              Your documents are in and under review. Verification can take up to 2 weeks — we&apos;ll email you the moment your account is approved.
            </p>
          </div>

          <div className={s.docsItemCard}>
            {['Government-issued photo ID', 'Proof of residency'].map(item => (
              <div key={item} className={s.docsItemRow}>
                <svg className={s.docsItemCheck} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="40 144 96 200 224 72"/>
                </svg>
                <span className={s.docsItemLabel}>{item}</span>
              </div>
            ))}
          </div>

          <Link href="/home" className={s.docsReceivedCta}>
            Back to dashboard
          </Link>

          <p className={s.docsReceivedQuestions}>
            Questions?{' '}
            <a href="mailto:support@surmount.ai">support@surmount.ai</a>
          </p>
        </div>
      </main>
    </div>
  );
}
