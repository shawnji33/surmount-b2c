import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function DocumentsReceivedPage() {
  return (
    <div className={s.docsReceivedPage}>
      <header className={s.docsReceivedTopbar}>
        <Link href="/home" className={s.topbarBrand}>
          <img src="https://www.figma.com/api/mcp/asset/3bbd6119-7028-47e5-9a7d-d4fafba87569" alt="" className={s.topbarBrandIcon} />
          <img src="https://www.figma.com/api/mcp/asset/3297adb2-a615-459c-b3a1-30442b03c519" alt="Surmount" className={s.topbarBrandName} />
        </Link>
      </header>

      <main className={s.docsReceivedMain}>
        <div className={s.docsReceivedContent}>
          <span className={s.docsStatusPill}>
            <span className={s.docsStatusPillDot} aria-hidden="true" />
            Documents received
          </span>

          <div className={s.docsReceivedHero}>
            <h1 className={s.docsReceivedTitle}>Thanks, Shawn</h1>
            <p className={s.docsReceivedSubtitle}>
              Your documents are in. We&apos;ll re-review your application within 1–2 business days and email you the moment you&apos;re approved.
            </p>
          </div>

          <div className={s.docsItemCard}>
            {['Government-issued photo ID', 'Proof of current address'].map(item => (
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
