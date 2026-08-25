import Link from 'next/link';
import s from '../_components/onboarding.module.css';

const REJECTED_DOCS = [
  {
    label: 'Government-issued photo ID',
    reason: 'The image was blurry and the text wasn’t legible. Please upload a clear photo with all 4 corners visible.',
  },
  {
    label: 'Proof of residency',
    reason: 'The document was dated more than 3 months ago. Please upload a statement or bill from the last 3 months.',
  },
];

export default function DocumentsRejectedPage() {
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
            <span className={`${s.docsStatusPillDot} ${s.docsStatusPillDotError}`} aria-hidden="true" />
            Verification unsuccessful
          </span>

          <div className={s.docsReceivedHero}>
            <h1 className={s.docsReceivedTitle}>We couldn&apos;t verify your documents</h1>
            <p className={s.docsReceivedSubtitle}>
              The documents you uploaded didn&apos;t pass review. Check the reasons below and upload new documents — re-verification can take up to 2 weeks.
            </p>
          </div>

          <div className={s.docsItemCard}>
            {REJECTED_DOCS.map(doc => (
              <div key={doc.label} className={`${s.docsItemRow} ${s.docsItemRowStart}`}>
                <svg className={s.docsItemX} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
                  <line x1="200" y1="56" x2="56" y2="200"/>
                  <line x1="200" y1="200" x2="56" y2="56"/>
                </svg>
                <div className={s.docsItemBody}>
                  <span className={s.docsItemLabel}>{doc.label}</span>
                  <span className={s.docsItemReason}>{doc.reason}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/onboarding/verify-documents" className={s.docsReceivedCta}>
            Upload new documents
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
