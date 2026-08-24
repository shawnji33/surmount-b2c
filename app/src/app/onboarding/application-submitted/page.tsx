import Link from 'next/link';
import s from '../_components/onboarding.module.css';

export default function ApplicationSubmittedPage() {
  return (
    <div className={s.appSubmittedPage}>
      <header className={s.topbar}>
        <span className={s.topbarSpacer} aria-hidden="true">Close</span>
        <div className={s.topbarBrand}>
          <img src="/assets/sidebar/logo-mark.svg" alt="" className={s.topbarBrandIcon} />
          <img src="/assets/sidebar/wordmark.svg" alt="Surmount" className={s.topbarBrandName} />
        </div>
        <Link href="/home" className={s.topbarBtn}>
          Close
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" aria-hidden="true">
            <line x1="200" y1="56" x2="56" y2="200"/>
            <line x1="200" y1="200" x2="56" y2="56"/>
          </svg>
        </Link>
      </header>

      <main className={s.appSubmittedMain}>
        <div className={s.appSubmittedContent}>
          <div className={s.appSubmittedBadge}>
            <span className={s.appSubmittedBadgeDot} aria-hidden="true" />
            Application in review
          </div>

          <div className={s.appSubmittedHero}>
            <h1 className={s.appSubmittedTitle}>You&apos;re in, Shawn</h1>
            <p className={s.appSubmittedSubtitle}>
              We&apos;ll review your application within 1–2 business days and email you the moment you&apos;re approved. Connect your bank now so you&apos;re ready to invest the second you&apos;re in.
            </p>
          </div>

          <div className={s.appSubmittedBtns}>
            <Link href="/home/get-started?state=pending" className={s.appSubmittedBtnSecondary}>
              Maybe later
            </Link>
            <Link href="/onboarding/link-bank" className={s.appSubmittedBtnPrimary}>
              Connect your bank
              <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
              </svg>
            </Link>
          </div>

          <p className={s.appSubmittedSupport}>
            Questions?{' '}
            <a href="mailto:support@surmount.ai">support@surmount.ai</a>
          </p>
        </div>
      </main>
    </div>
  );
}
